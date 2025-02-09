import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly('test'), choices: ['development', 'production', 'test'] }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(8080) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:8080') }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  VALKEY_HOST: str({ devDefault: testOnly('localhost') }),
  VALKEY_PORT: num({ devDefault: testOnly(6379) }),
  AUTH_PRIVATE_KEY: str(),
  AUTH_PUBLIC_KEY: str(),
  AUTH_REFRESH_TOKEN_COOKIE_NAME: str({ devDefault: testOnly('rt_f2b4c8d9') }),
});
