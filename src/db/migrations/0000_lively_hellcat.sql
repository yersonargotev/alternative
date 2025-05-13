CREATE TYPE "public"."tool_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "tool_alternatives" (
	"original_tool_id" integer NOT NULL,
	"alternative_tool_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tool_alternatives_original_tool_id_alternative_tool_id_pk" PRIMARY KEY("original_tool_id","alternative_tool_id")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"website_url" varchar(255),
	"repo_url" varchar(255) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"github_stars" integer,
	"github_forks" integer,
	"github_issues" integer,
	"github_last_commit" timestamp with time zone,
	"status" "tool_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"submitted_by_user_id" varchar(191),
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"tool_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_tool_vote_unique" UNIQUE("user_id","tool_id")
);
--> statement-breakpoint
ALTER TABLE "tool_alternatives" ADD CONSTRAINT "tool_alternatives_original_tool_id_tools_id_fk" FOREIGN KEY ("original_tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_alternatives" ADD CONSTRAINT "tool_alternatives_alternative_tool_id_tools_id_fk" FOREIGN KEY ("alternative_tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "original_tool_idx" ON "tool_alternatives" USING btree ("original_tool_id");--> statement-breakpoint
CREATE INDEX "alternative_tool_idx" ON "tool_alternatives" USING btree ("alternative_tool_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "status_idx" ON "tools" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repo_url_idx" ON "tools" USING btree ("repo_url");--> statement-breakpoint
CREATE INDEX "vote_tool_id_idx" ON "votes" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "vote_user_id_idx" ON "votes" USING btree ("user_id");