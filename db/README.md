## Database migrations

This project uses **Supabase Postgres**.

### Apply migrations (manual)
Until Supabase CLI is wired up, you can apply migrations by copying SQL into the Supabase **SQL editor**:

- `db/migrations/0001_init.sql`

### Notes
- Row Level Security (RLS) is enabled on all core tables.
