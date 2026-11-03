
# SACHI Personal Website V4

Personal website with Supabase backend.

## Features

- Responsive personal website
- Admin dashboard
- Supabase authentication
- Website settings management
- Facebook downloader interface
- TikTok downloader interface
- Instagram downloader interface
- API provider directory
- Backend status checker

## Setup

1. Upload website files to GitHub.
2. Enable GitHub Pages.
3. Open Supabase SQL Editor.
4. Run supabase-setup.sql.
5. Create an admin user in Supabase Authentication.
6. Add the admin UUID to admin_users.
7. Deploy the super-action Edge Function.

## API Management

API provider information can be stored in the
admin dashboard.

API credentials must be stored as server-side
Supabase Edge Function secrets.

Never expose service role keys in frontend files.

## Downloader

Downloader interfaces are included.

Actual downloading requires a compatible API
and a server-side adapter.

## Backend

Supabase Edge Function:

/functions/v1/super-action
