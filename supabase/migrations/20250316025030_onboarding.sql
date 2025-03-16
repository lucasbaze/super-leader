alter table "public"."user_profile" add column "onboarding" jsonb default '{"steps": {"shareValueAsk": {"completed": false}}, "completed": false, "currentStep": "shareValueAsk"}'::jsonb;


