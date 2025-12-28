---
name: supabase-workflow
description: |
  Supabase backend fejlesztési workflow az iNLighT Rental Manager projekthez.
  Használd amikor: adatbázis séma módosítás, RLS policy-k írása, Edge Functions 
  fejlesztés, Storage kezelés, Auth konfiguráció, vagy Supabase MCP műveletek.
  Tartalmazza a projekt-specifikus RLS mintákat és Edge Function sablonokat.
---

# Supabase Workflow Skill

## Projekt Kontextus

- **Projekt:** iNLighT Rental Manager
- **Role-ok:** super_admin, admin
- **Táblák:** categories, products, product_components, clients, rentals, rental_items, rental_item_suppliers, suppliers, user_profiles, inventory_logs

## MCP Használat

Mindig használd a Supabase MCP-t adatbázis műveletekhez:

```
supabase_list_tables         → Táblák listázása
supabase_get_table_schema    → Séma lekérdezés
supabase_execute_sql         → SQL futtatás
supabase_apply_migration     → Migráció
```

## RLS Policy Minták

### Alap RLS Engedélyezés
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Role-based Policy Pattern

```sql
-- Super Admin: teljes hozzáférés
CREATE POLICY "super_admin_full_access" ON table_name
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'super_admin'
  )
);

-- Admin: csak olvasás és létrehozás
CREATE POLICY "admin_read_create" ON table_name
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "admin_insert" ON table_name
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);
```

### Publikus olvasás (products)
```sql
CREATE POLICY "public_read_products" ON products
FOR SELECT TO anon
USING (is_public = true);
```

## Edge Function Sablon

```typescript
// supabase/functions/function-name/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Function logic here...
    const result = { success: true }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

## Reminder Edge Function (Bérlés lejárat)

```typescript
// supabase/functions/rental-reminder/index.ts
// Cron: minden nap 9:00-kor

serve(async (req) => {
  const supabase = createClient(/*...*/)

  // Lejáró bérlések (reminder_days_before napon belül)
  const { data: rentals } = await supabase
    .from('rentals')
    .select(`
      *,
      clients (*),
      rental_items (
        *,
        products (name_en, name_hu)
      )
    `)
    .eq('status', 'active')
    .eq('reminder_sent', false)
    .lte('end_date', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString())

  for (const rental of rentals || []) {
    // Send notification (push/email)
    await sendReminder(rental)
    
    // Mark as sent
    await supabase
      .from('rentals')
      .update({ reminder_sent: true })
      .eq('id', rental.id)
  }
})
```

## Weekly Report Edge Function

```typescript
// supabase/functions/weekly-report/index.ts
// Cron: Péntek 18:00

serve(async (req) => {
  const supabase = createClient(/*...*/)
  
  const lastFriday = new Date()
  lastFriday.setDate(lastFriday.getDate() - 7)

  // Készletmozgás lekérdezés
  const { data: movements } = await supabase
    .rpc('get_weekly_movement', {
      p_start_date: lastFriday.toISOString(),
      p_end_date: new Date().toISOString()
    })

  // Report generálás és mentés
  // ...
})
```

## Típus Generálás

Minden séma módosítás után:
```bash
npx supabase gen types typescript --project-id PROJECT_ID > src/types/database.ts
```

## Storage Bucket Konfiguráció

```sql
-- Product images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Policy: Authenticated users can upload
CREATE POLICY "auth_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy: Public read
CREATE POLICY "public_read" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'product-images');
```

## Trigger Minták

### Updated_at automatikus frissítés
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Inventory log automatikus
```sql
CREATE OR REPLACE FUNCTION log_rental_item_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO inventory_logs (product_id, rental_id, action, quantity_change, created_by)
    VALUES (NEW.product_id, NEW.rental_id, 'rent_out', -NEW.quantity, auth.uid());
  ELSIF TG_OP = 'UPDATE' AND NEW.return_status = 'returned' THEN
    INSERT INTO inventory_logs (product_id, rental_id, action, quantity_change, created_by)
    VALUES (NEW.product_id, NEW.rental_id, 'return', NEW.returned_quantity, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Checklist

- [ ] RLS engedélyezve minden táblán
- [ ] Policy-k role-based (super_admin/admin)
- [ ] Edge Functions CORS headers
- [ ] Típusok generálva módosítás után
- [ ] Trigger-ek tesztelve
- [ ] Storage bucket policy-k beállítva
