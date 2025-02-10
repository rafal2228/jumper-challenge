'use client';
import { APIResponse, authHttp, http } from '@/utils/http';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { atom, useAtom, useStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { jwtDecode } from 'jwt-decode';
import { useSnackbar } from 'notistack';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
import { Address, isAddress } from 'viem';
import { createSiweMessage, CreateSiweMessageParameters } from 'viem/siwe';
import { useAccount, useSignMessage } from 'wagmi';

const ACCESS_TOKEN_KEY = '@jumper/access_token';

const isBrowser = !!globalThis.window;

export const decodeToken = (token: string): { address: Address } | null => {
  try {
    const decoded = jwtDecode(token);

    if (typeof decoded.exp !== 'number' || decoded.exp < Date.now() / 1000) {
      return null;
    }

    const address = (decoded as unknown as { address?: Address }).address;

    return address && isAddress(address) ? { address } : null;
  } catch (e) {
    return null;
  }
};

const accessTokenAtom = atomWithStorage<string | null>(ACCESS_TOKEN_KEY, null);
const authAtom = atom(
  (get) => {
    const accessToken = get(accessTokenAtom);

    if (!accessToken) {
      return {
        accessToken: null,
        address: null,
      };
    }

    const decoded = decodeToken(accessToken);

    if (!decoded) {
      return {
        accessToken: null,
        address: null,
      };
    }

    return {
      accessToken,
      address: decoded.address,
    };
  },
  (_get, set, value: string | null) => {
    set(accessTokenAtom, value);
  },
);

const useAuthInterceptors = () => {
  const store = useStore();

  useEffect(() => {
    const accessId = authHttp.interceptors.request.use(async (config) => {
      const authToken = store.get(authAtom).accessToken;

      if (!authToken) {
        return config;
      }

      config.headers.Authorization = `Bearer ${authToken}`;

      return config;
    });
    const refreshId = authHttp.interceptors.response.use(undefined, async (error) => {
      const { config, response: { status } = {} } = error as AxiosError<unknown>;

      if (status !== 401 || !config) {
        return Promise.reject(error);
      }

      try {
        const res = await http.post<APIResponse<{ accessToken: string }>>('/auth/refresh');

        const accessToken = res.data.responseObject.accessToken;

        config.headers = config.headers.setAuthorization(`Bearer ${accessToken}`);
        store.set(accessTokenAtom, accessToken);

        return http(config);
      } catch (error) {
        store.set(accessTokenAtom, null);

        return Promise.reject(error);
      }
    });

    return () => {
      authHttp.interceptors.request.eject(accessId);
      authHttp.interceptors.request.eject(refreshId);
    };
  }, [store]);
};

const useAuthProvider = () => {
  useAuthInterceptors();
  const { enqueueSnackbar } = useSnackbar();
  const account = useAccount();
  const [auth, setToken] = useAtom(authAtom);
  const getNonce = useMutation({
    mutationFn: async (address: Address) => {
      const res = await http.post<APIResponse<{ nonce: string }>>('/auth/nonce', {
        address,
      });

      return res.data.responseObject.nonce;
    },
    onError: (error) => {
      enqueueSnackbar(`Unable to generate nonce: ${error.message}`, { variant: 'error' });
    },
  });
  const sign = useSignMessage({
    mutation: {
      onError: (error) => {
        if (error.name !== 'UserRejectedRequestError') {
          enqueueSnackbar(`Unable to obtain signature: ${error.message}`, { variant: 'error' });
        }
      },
    },
  });
  const verify = useMutation({
    mutationFn: async (params: { signature: string; message: string; address: Address; nonce: string }) => {
      const res = await http.post<APIResponse<{ accessToken: string }>>('/auth/verify', params);

      return res.data.responseObject.accessToken;
    },
    onError: (error) => {
      enqueueSnackbar(`Unable to verify signature: ${error.message}`, { variant: 'error' });
    },
  });

  const handleConfirmAddress = async (address: Address) => {
    if (account.status !== 'connected' || !isBrowser) {
      return;
    }

    try {
      const nonce = await getNonce.mutateAsync(address);

      const message = createSiweMessage({
        address,
        chainId: account.chainId,
        domain: location.hostname,
        nonce,
        uri: location.href,
        version: '1',
      });

      const signature = await sign.signMessageAsync({
        message,
      });

      const accessToken = await verify.mutateAsync({ signature, message, address, nonce });

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      setToken(accessToken);
    } catch (error) {}
  };

  const isPending = getNonce.isPending || sign.isPending || verify.isPending;

  return useMemo(
    () => ({
      address: auth.address,
      isPending,
      handleConfirmAddress,
    }),
    [auth.address, isPending, handleConfirmAddress],
  );
};

const Context = createContext<ReturnType<typeof useAuthProvider>>({
  address: null,
  isPending: false,
  handleConfirmAddress: async () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  return <Context.Provider value={useAuthProvider()}>{children}</Context.Provider>;
};

export const useAuth = () => useContext(Context);
