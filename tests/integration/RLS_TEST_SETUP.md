# RLS Integration Tests - Setup Guide

## Required Test Users

RLS (Row Level Security) integration tests require **two test users** with different roles:

### 1. Super Admin User ✅ (Already Created)
- **Email**: `admin@inlight.hu`
- **Password**: `Test1234!`
- **Role**: `super_admin`
- **Purpose**: Test full access permissions

### 2. Admin User ⚠️ (Needs to be Created)
- **Email**: `admin2@inlight.hu`
- **Password**: `Test1234!`
- **Role**: `admin`
- **Purpose**: Test restricted admin permissions

---

## Creating the Admin Test User

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/njqkdsoccdosydidmkqj
2. Navigate to **Authentication** → **Users**

### Step 2: Create New User

Click **"Add user"** and fill in:

```
Email: admin2@inlight.hu
Password: Test1234!
Auto Confirm Email: ✅ (checked)
```

Click **"Create user"**

### Step 3: Get User ID

After creation, you'll see the new user in the list. Copy the **User ID** (UUID format).

Example:
```
User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Step 4: Add User Profile

Go to **SQL Editor** and run this query (replace `<USER_ID>` with actual ID):

```sql
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  '<USER_ID>',  -- Replace with actual user ID from Step 3
  'admin2@inlight.hu',
  'Test Admin User',
  'admin',
  true
);
```

Example with actual UUID:
```sql
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'admin2@inlight.hu',
  'Test Admin User',
  'admin',
  true
);
```

### Step 5: Verify User Profile

Run this query to verify:

```sql
SELECT id, email, role, full_name
FROM user_profiles
WHERE email = 'admin2@inlight.hu';
```

Expected result:
```
| id                                   | email              | role  | full_name         |
|--------------------------------------|--------------------|-------|-------------------|
| a1b2c3d4-e5f6-7890-abcd-ef1234567890 | admin2@inlight.hu  | admin | Test Admin User   |
```

---

## Verify Setup

Run integration tests to verify setup:

```bash
npm run test:integration
```

If admin2 user is correctly set up, you should see:

```
🔐 Test Users:
   Super Admin: admin@inlight.hu (super_admin)
   Admin: admin2@inlight.hu (admin)
```

---

## Environment Variables

The test credentials are stored in `.env.test`:

```bash
# Super Admin User (already exists)
TEST_SUPER_ADMIN_EMAIL=admin@inlight.hu
TEST_SUPER_ADMIN_PASSWORD=Test1234!

# Admin User (needs to be created)
TEST_ADMIN_EMAIL=admin2@inlight.hu
TEST_ADMIN_PASSWORD=Test1234!
```

---

## Troubleshooting

### Error: "Failed to authenticate admin: Invalid login credentials"

**Cause**: admin2@inlight.hu user doesn't exist or has wrong password

**Solution**: Follow Steps 1-4 above to create the user

### Error: "Foreign key violation on user_profiles"

**Cause**: User ID in INSERT doesn't match actual auth.users ID

**Solution**: Make sure to copy the exact User ID from Step 3

### Error: "Duplicate key value violates unique constraint"

**Cause**: User profile already exists

**Solution**:
1. Check if user exists:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'admin2@inlight.hu';
   ```
2. If role is wrong, update it:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE email = 'admin2@inlight.hu';
   ```

---

## Security Note

⚠️ **Important**: These test users should **only exist in development/test environments**.

**Never use these credentials in production!**

- Production users should have strong, unique passwords
- Test users should be deleted or disabled in production databases
- `.env.test` is gitignored and should never be committed

---

## What Gets Tested

The RLS tests verify these policies:

### user_profiles Table
- ✅ Users can read own profile
- ✅ Super admins can read all profiles
- ✅ Admins cannot read other profiles
- ✅ Only super admins can insert/update/delete profiles

### rentals Table
- ✅ Super admin: full CRUD access
- ✅ Admin: read all, insert (own), update (own), no delete
- ✅ Admins cannot update rentals created by others (unless super_admin)

### clients Table
- ✅ Admin & super_admin: read all, insert
- ✅ Super admin only: update, delete

### products Table
- ✅ Public: read active products
- ✅ Admin & super_admin: read all products
- ✅ Super admin only: insert, update, delete

---

**Created**: 2026-01-02
**Last Updated**: 2026-01-02
