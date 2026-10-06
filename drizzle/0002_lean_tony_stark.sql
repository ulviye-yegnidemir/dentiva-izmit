CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"treatment" text NOT NULL,
	"doctor" text NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"patient_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"consent" boolean NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor" text NOT NULL,
	"block_date" date NOT NULL,
	"block_time" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_doctor_idx" ON "appointments" USING btree ("doctor");--> statement-breakpoint
CREATE UNIQUE INDEX "appointments_active_slot_unique" ON "appointments" USING btree ("doctor","appointment_date","appointment_time") WHERE "appointments"."status" <> 'cancelled';--> statement-breakpoint
CREATE UNIQUE INDEX "availability_block_unique" ON "availability_blocks" USING btree ("doctor","block_date","block_time");