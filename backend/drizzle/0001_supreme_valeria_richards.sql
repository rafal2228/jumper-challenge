ALTER TABLE "tokens" ADD COLUMN "priceInUSD" bigint;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "priceUpdatedAt" timestamp DEFAULT now() NOT NULL;