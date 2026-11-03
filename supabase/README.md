
# SACHI Supabase Setup

## Project

Supabase project reference:

umhbsnquwacawipcmbjr

## Database

Run the root supabase-setup.sql file
inside the Supabase SQL Editor.

## Edge Function

Function name:

super-action

File:

supabase/functions/super-action/index.ts

## Deployment

Deploy using Supabase CLI:

supabase functions deploy super-action

## Required environment variables

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

These must remain server-side secrets.

## Admin Setup

Create an account using Supabase Authentication.

Copy the user's UUID and insert it into
the public.admin_users table.

## Security

Never expose the service role key publicly.
Use Row Level Security for database access.
