CREATE TABLE "recurring_transaction_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"target_month" date NOT NULL,
	"scheduled_date" date NOT NULL,
	"transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recurring_transaction_runs_template_month_unique" UNIQUE("template_id","target_month"),
	CONSTRAINT "recurring_transaction_runs_target_month_first_day" CHECK ("recurring_transaction_runs"."target_month" = date_trunc('month', "recurring_transaction_runs"."target_month")::date)
);
--> statement-breakpoint
CREATE TABLE "recurring_transaction_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"day_of_month" integer NOT NULL,
	"category_id" uuid,
	"payment_method_id" uuid,
	"note" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recurring_transaction_templates_amount_positive" CHECK ("recurring_transaction_templates"."amount" > 0),
	CONSTRAINT "recurring_transaction_templates_day_valid" CHECK ("recurring_transaction_templates"."day_of_month" between 1 and 31),
	CONSTRAINT "recurring_transaction_templates_active_requires_refs" CHECK ("recurring_transaction_templates"."is_active" = false or ("recurring_transaction_templates"."category_id" is not null and "recurring_transaction_templates"."payment_method_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "recurring_transaction_runs" ADD CONSTRAINT "recurring_transaction_runs_template_id_recurring_transaction_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."recurring_transaction_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction_runs" ADD CONSTRAINT "recurring_transaction_runs_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction_templates" ADD CONSTRAINT "recurring_transaction_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction_templates" ADD CONSTRAINT "recurring_transaction_templates_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recurring_transaction_runs_template_idx" ON "recurring_transaction_runs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "recurring_transaction_runs_target_month_idx" ON "recurring_transaction_runs" USING btree ("target_month");--> statement-breakpoint
CREATE INDEX "recurring_transaction_runs_transaction_idx" ON "recurring_transaction_runs" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "recurring_transaction_templates_is_active_idx" ON "recurring_transaction_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "recurring_transaction_templates_category_idx" ON "recurring_transaction_templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "recurring_transaction_templates_payment_method_idx" ON "recurring_transaction_templates" USING btree ("payment_method_id");