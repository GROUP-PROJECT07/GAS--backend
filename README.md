# GAS Backend (Supabase Version)

This is the Supabase-based backend for the Ghana Audit Service Correspondence Management System.

## Features

- Supabase PostgreSQL with Row-Level Security
- Supabase Auth for Admin/User roles
- File upload support via Supabase Storage
- Auto-generated registry numbers via Edge Functions

## Structure

- `schema.sql`: Database schema
- `edge-functions/generateRegistryNumber.ts`: Function to insert correspondence and generate registry number
- `storage_policy.sql`: Supabase storage policy for correspondence files

## Setup

1. Create a Supabase project at https://supabase.com
2. Run `schema.sql` in Supabase SQL editor.
3. Create a storage bucket called `correspondence-files`.
4. Deploy the edge function from `edge-functions/` using Supabase CLI.
5. Apply storage policies from `storage_policy.sql`.

## Deploy Edge Function

```bash
supabase functions deploy generateRegistryNumber --project-ref your-project-ref
```

## Usage

Call the deployed edge function with correspondence details to create a new entry.
