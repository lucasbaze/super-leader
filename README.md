# Superleader

Superleader is a platform to help you get, keep, and grow your network. This is the next.js implementation of the platform.

## Development

1. Clone the repo
2. Run `yarn install`
3. Start Supabase with Docker running locally
4. Run `yarn dev`
5. Load the supabase client at localhost:54321
6. Navigate to auth and create a new auth user with a password
7. Grab the id and run the script `src/scripts/setup-new-user.ts` with the id.


### Production Data dump for development

1. Download the latest production database dump from Supabase
2. Run `psql -h localhost -p 54322 -U postgres -d postgres -f "/path/to/data.backup`

### Trigger.dev

All async tasks are handled by Trigger.dev in the src/trigger folder.

1. Run `npx trigger.dev dev` to run the tasks locally
2. Run `npx trigger.dev deploy` to deploy the changes to production

Make sure that you have the TRIGGER_SECRET_KEY environment variable set in your .env.local file.

You also need to make sure that trigger.dev has any environment variables in the trigger.dev dashboard as those methods are hosted on trigger.dev.


### NGROK - Tunneling for Integrations

Update the NEXT_PUBLIC_API_TUNNEL_URL environment variable in the .env.local file to the ngrok URL.

```bash
> ngrok http http://localhost:3000
```

### Common Commands

#### Supabase

Getting types from local Supabase CLI:

```bash
> npx supabase gen types typescript --local > ./src/types/database/supabase.ts
```

Getting diff of migrations from local Supabase CLI:

```bash
> npx supabase db diff --local
```

Creating a new migration:

```bash
> npx supabase migration new <migration-name>
```

Running migrations:

```bash
> npx supabase migration up
```

Workflow:
```
> npx supabase migration new <migration-name>
Add your changes to the new migration file (e.g. via composer)
> npx supabase reset
You can add multiple migrations at a time if needed or delete the migration file, and rewrite.

> rm -rf supabase/migrations
> npx supabase db pull --remote
> npx supabase db pull --local

> supabase db reset // will reapply the migrations
> npx supabase migration up
```

## Database Stuff

Get a dump of the schema from the local database
> docker exec -t supabase_db_supabase pg_dump -s -U postgres -d postgres > schema.sql



### Prod Migration Flow: 

Local Database Changes: 

1. Pull the schema from supabase local and add to a new migration file
> npx supabase db diff --local --file my_migration

2. Apply the migration to the test environment
> npx supabase db reset
> yarn seed

or if you just want to apply the last migration that was added
> npx supabase db migrate up
<!-- > npx supabase db push --db-url $SUPABASE_TEST_DB_URL --schema public --file my_migration.sql -->

3. Save & commit the migration file to the repo
> git add . 
> git commit -m "new migration"

4. Push schema changes to the database
> npx supabase link 
Link to the test database for testing purposes
> npx supabase db push 