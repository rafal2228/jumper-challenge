import { render } from '@/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AccountDetails } from './AccountDetails';
import * as wagmi from 'wagmi';

vi.mock('wagmi', async (importOriginal) => {
  const mod: typeof wagmi = await importOriginal();

  return {
    ...mod,
    useAccount: vi.fn(mod.useAccount),
    useEnsName: vi.fn(mod.useEnsName),
  };
});

describe('AccountDetails', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('returns null when no address is present', () => {
    const { container } = render(<AccountDetails />);

    expect(container.firstChild).toBeNull();
  });

  test('returns account details when address is present', () => {
    vi.mocked(wagmi.useAccount).mockReturnValueOnce({
      address: '0x1234567890123456789012345678901234567890',
      connector: { name: 'MetaMask', icon: '/metamask.svg' },
    } as unknown as ReturnType<typeof wagmi.useAccount>);

    vi.mocked(wagmi.useEnsName).mockReturnValueOnce({
      data: 'jumper.eth',
      status: 'success',
    } as unknown as ReturnType<typeof wagmi.useEnsName>);

    const { getByText, getByAltText } = render(<AccountDetails />);

    expect(getByText('0x1234...7890')).toBeInTheDocument();
    expect(getByText('jumper.eth')).toBeInTheDocument();
    expect(getByAltText('MetaMask')).toBeInTheDocument();
  });
});
