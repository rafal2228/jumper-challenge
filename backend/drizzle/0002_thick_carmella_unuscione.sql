ALTER TABLE "holdings" ALTER COLUMN "amount" SET DATA TYPE numeric(78, 0);--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "priceInUSD" SET DATA TYPE numeric(78, 0);