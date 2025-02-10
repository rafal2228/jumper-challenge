import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@/common/utils/envConfig';
import * as schema from './schema';

const pool = new Pool({
  connectionString: env.POSTGRES_URL,
});

export const db = drizzle({
  client: pool,
  schema,
});
