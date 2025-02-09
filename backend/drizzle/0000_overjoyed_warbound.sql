CREATE TABLE "holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(42) NOT NULL,
	"tokenId" uuid NOT NULL,
	"amount" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(42) NOT NULL,
	"chainId" integer NOT NULL,
	"name" varchar NOT NULL,
	"symbol" varchar NOT NULL,
	"decimals" integer NOT NULL,
	"logoUrl" varchar,
	CONSTRAINT "tokens_address_chainId_unique" UNIQUE("address","chainId")
);
--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_tokenId_tokens_id_fk" FOREIGN KEY ("tokenId") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;