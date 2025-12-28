# Supabase Migrations

Database migrations for iNLighT Rental Manager.

## Migration Files

1. **20241231235900_create_user_profiles.sql** - User profiles with role-based access
2. **20241231235930_create_clients.sql** - Client management
3. **20250101000000_create_rentals_table.sql** - Main rentals table
4. **20250101000001_rentals_rls_policies.sql** - RLS policies for rentals table

## RLS Policy Summary

### rentals table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| super_admin | ✅ All | ✅ All | ✅ All | ✅ All |
| admin | ✅ All | ✅ Yes | ✅ Own/Super | ❌ No |

### Automatic Features

- **Auto-generated rental_number**: Format `R-YYYYMMDD-XXXX`
- **Auto-updated timestamps**: `updated_at` field
- **Created by tracking**: `created_by` field

## Apply Migrations

Using Supabase CLI:

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply all migrations
supabase db push

# Generate TypeScript types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Using Supabase MCP:

```typescript
// Apply migration using Supabase MCP tool
await supabase_apply_migration({
  project_id: 'YOUR_PROJECT_ID',
  name: 'create_rentals_with_rls',
  query: '-- SQL content here'
})
```

## Security Notes

1. **RLS is enabled** on all tables
2. **Super admin** role has full access
3. **Admin** role has limited access (no DELETE on rentals)
4. All policies check `user_profiles` table for role verification
5. Frontend uses **ANON_KEY** only, never SERVICE_ROLE_KEY
