alter table "public"."user_profile" add column "onboarding" jsonb default '{"steps": {"goals": {"completed": false}, "personal": {"completed": false}, "challenges": {"completed": false}, "professional": {"completed": false}, "shareValueAsk": {"completed": false}, "valuesBeliefs": {"completed": false}, "hobbiesEcosystems": {"completed": false}, "strengthsSuccesses": {"completed": false}}, "completed": false, "currentStep": "personal"}'::jsonb;


