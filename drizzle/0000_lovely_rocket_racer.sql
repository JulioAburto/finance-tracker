CREATE TYPE "public"."alert_level" AS ENUM('info', 'warning', 'danger', 'exceeded');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'NIO');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('cash', 'debit', 'credit_card', 'bank_transfer', 'prepaid', 'agency', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "alert_level" NOT NULL,
	"title" varchar(180) NOT NULL,
	"message" text NOT NULL,
	"category_id" uuid,
	"transaction_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"default_currency" "currency" DEFAULT 'USD' NOT NULL,
	"default_exchange_rate" numeric(12, 4) DEFAULT '36.6243' NOT NULL,
	"credit_card_mode_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_default_exchange_rate_positive" CHECK ("app_settings"."default_exchange_rate" > 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"monthly_budget_usd" numeric(12, 2) NOT NULL,
	"is_essential" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"warning_threshold" integer DEFAULT 70 NOT NULL,
	"danger_threshold" integer DEFAULT 80 NOT NULL,
	"exceeded_threshold" integer DEFAULT 100 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_monthly_budget_non_negative" CHECK ("categories"."monthly_budget_usd" >= 0),
	CONSTRAINT "categories_warning_threshold_positive" CHECK ("categories"."warning_threshold" > 0),
	CONSTRAINT "categories_danger_threshold_after_warning" CHECK ("categories"."danger_threshold" > "categories"."warning_threshold"),
	CONSTRAINT "categories_exceeded_threshold_at_or_after_danger" CHECK ("categories"."exceeded_threshold" >= "categories"."danger_threshold")
);
--> statement-breakpoint
CREATE TABLE "merchant_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern" varchar(240) NOT NULL,
	"category_id" uuid NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_rules_pattern_unique" UNIQUE("pattern")
);
--> statement-breakpoint
CREATE TABLE "monthly_budget_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monthly_budget_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"amount_usd" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_budget_categories_budget_category_unique" UNIQUE("monthly_budget_id","category_id"),
	CONSTRAINT "monthly_budget_categories_amount_non_negative" CHECK ("monthly_budget_categories"."amount_usd" >= 0)
);
--> statement-breakpoint
CREATE TABLE "monthly_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" date NOT NULL,
	"salary_usd" numeric(12, 2) NOT NULL,
	"expected_savings_usd" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_budgets_month_unique" UNIQUE("month"),
	CONSTRAINT "monthly_budgets_salary_positive" CHECK ("monthly_budgets"."salary_usd" > 0),
	CONSTRAINT "monthly_budgets_expected_savings_non_negative" CHECK ("monthly_budgets"."expected_savings_usd" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"credit_limit_usd" numeric(12, 2),
	"statement_cut_day" integer,
	"payment_due_day" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_name_unique" UNIQUE("name"),
	CONSTRAINT "payment_methods_credit_limit_non_negative" CHECK ("payment_methods"."credit_limit_usd" is null or "payment_methods"."credit_limit_usd" >= 0),
	CONSTRAINT "payment_methods_statement_cut_day_valid" CHECK ("payment_methods"."statement_cut_day" is null or "payment_methods"."statement_cut_day" between 1 and 31),
	CONSTRAINT "payment_methods_payment_due_day_valid" CHECK ("payment_methods"."payment_due_day" is null or "payment_methods"."payment_due_day" between 1 and 31)
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"exchange_rate" numeric(12, 4) NOT NULL,
	"amount_usd" numeric(12, 2) NOT NULL,
	"amount_nio" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"type" "transaction_type" DEFAULT 'expense' NOT NULL,
	"category_id" uuid,
	"payment_method_id" uuid,
	"note" text,
	"raw_input" text,
	"classification_confidence" numeric(5, 4),
	"classification_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_amount_positive" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_exchange_rate_positive" CHECK ("transactions"."exchange_rate" > 0),
	CONSTRAINT "transactions_amount_usd_non_negative" CHECK ("transactions"."amount_usd" >= 0),
	CONSTRAINT "transactions_amount_nio_non_negative" CHECK ("transactions"."amount_nio" >= 0),
	CONSTRAINT "transactions_classification_confidence_valid" CHECK ("transactions"."classification_confidence" is null or "transactions"."classification_confidence" between 0 and 1)
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_rules" ADD CONSTRAINT "merchant_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_budget_categories" ADD CONSTRAINT "monthly_budget_categories_monthly_budget_id_monthly_budgets_id_fk" FOREIGN KEY ("monthly_budget_id") REFERENCES "public"."monthly_budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_budget_categories" ADD CONSTRAINT "monthly_budget_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_level_idx" ON "alerts" USING btree ("level");--> statement-breakpoint
CREATE INDEX "alerts_category_idx" ON "alerts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "alerts_transaction_idx" ON "alerts" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "alerts_is_read_idx" ON "alerts" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "categories_is_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "merchant_rules_category_idx" ON "merchant_rules" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "merchant_rules_is_active_idx" ON "merchant_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "merchant_rules_priority_idx" ON "merchant_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "monthly_budget_categories_budget_idx" ON "monthly_budget_categories" USING btree ("monthly_budget_id");--> statement-breakpoint
CREATE INDEX "monthly_budget_categories_category_idx" ON "monthly_budget_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "payment_methods_type_idx" ON "payment_methods" USING btree ("type");--> statement-breakpoint
CREATE INDEX "payment_methods_is_active_idx" ON "payment_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_category_idx" ON "transactions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "transactions_payment_method_idx" ON "transactions" USING btree ("payment_method_id");--> statement-breakpoint
CREATE INDEX "transactions_currency_idx" ON "transactions" USING btree ("currency");