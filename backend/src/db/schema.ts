import { relations } from 'drizzle-orm';
import { integer, pgTable, varchar, uuid, unique, bigint, timestamp, numeric } from 'drizzle-orm/pg-core';

export const tokens = pgTable(
  'tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    address: varchar({ length: 42 }).notNull(),
    chainId: integer().notNull(),
    name: varchar().notNull(),
    symbol: varchar().notNull(),
    decimals: integer().notNull(),
    logoUrl: varchar(),
    // Switching to simple varchar because of:
    // https://github.com/drizzle-team/drizzle-orm/issues/1453
    priceInUSD: varchar(),
    priceUpdatedAt: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [unique().on(table.address, table.chainId)],
);

export const holdings = pgTable('holdings', {
  id: uuid().primaryKey().defaultRandom(),
  address: varchar({ length: 42 }).notNull(),
  tokenId: uuid()
    .notNull()
    .references(() => tokens.id, { onDelete: 'cascade' }),
  // Switching to simple varchar because of:
  // https://github.com/drizzle-team/drizzle-orm/issues/1453
  amount: varchar().notNull(),
});

export const holdingsRelations = relations(holdings, ({ one }) => ({
  token: one(tokens, {
    fields: [holdings.tokenId],
    references: [tokens.id],
  }),
}));
