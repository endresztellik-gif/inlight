# M3 Reports Module - Advanced Features Implementation

## ✅ Completed Features

### 1. Advanced Filters (`src/components/reports/AdvancedFilters.tsx`)

A comprehensive filtering component with the following capabilities:

**Filter Types:**
- **Date Range:** Start and end date filters
- **Status Multi-select:** Filter by rental status (draft, active, pending_return, completed, cancelled)
- **Rental Type:** Filter between rentals, subrentals, or all
- **Amount Range:** Min/max amount filters
- **Client Search:** Case-insensitive client name search
- **Product Search:** Product name/serial search (backend support required)

**Saved Filters:**
- Save custom filter combinations with names
- Load saved filters with one click
- Delete saved filters
- Stored in localStorage (can be migrated to Supabase for multi-device sync)

**UI Features:**
- Active filters summary badges
- Clear all filters button
- Responsive layout
- Fully translated (EN/HU)

### 2. Report Scheduler (`src/components/reports/ReportScheduler.tsx`)

Email scheduling interface for automated reports:

**Features:**
- **Schedule Creation:** Create named report schedules
- **Report Types:** All 6 report types (rentals, clients, products, revenue, profit, comparison)
- **Recurrence:** Daily, weekly, or monthly schedules
- **Recipients:** Multiple email addresses per schedule
- **Filters:** Apply current filters or customize per schedule
- **Schedule Management:** Edit, pause/resume, delete schedules
- **Status Display:** Active/paused status, next run date, recipient count

**Current Storage:**
- Schedules stored in localStorage
- Ready for Supabase migration (see Migration Guide below)

### 3. Database Migration

**File:** `supabase/migrations/20250103000017_create_scheduled_reports.sql`

Creates the `scheduled_reports` table with:
- Full schedule metadata (name, type, recurrence, recipients, filters)
- RLS policies for admin/super_admin access
- Helper function `update_next_run()` to calculate next execution
- Automatic `updated_at` trigger

### 4. Supabase Edge Function

**File:** `supabase/functions/send-scheduled-reports/index.ts`

Automated report generation and email delivery:

**Functionality:**
- Fetches due scheduled reports from database
- Generates report data based on filters
- Creates formatted HTML emails
- Sends emails to all recipients
- Updates next_run date after successful send

**Current State:**
- ✅ Core logic implemented
- ✅ HTML email template with styled tables
- ⏳ Email provider integration (placeholder - needs configuration)

---

## 🚀 Next Steps for Production Deployment

### Step 1: Apply Database Migration

```bash
# Test locally
SUPABASE_ACCESS_TOKEN="your_token" supabase db push

# Or apply to production
SUPABASE_ACCESS_TOKEN="your_token" supabase db push --project-ref your-project-ref
```

### Step 2: Migrate Schedules from localStorage to Supabase

Update `ReportScheduler.tsx` to use Supabase instead of localStorage:

```typescript
// Replace localStorage logic with Supabase queries
import { useQuery, useMutation } from '@tanstack/react-query'

// Fetch schedules
const { data: schedules } = useQuery({
  queryKey: ['scheduledReports'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
})

// Create schedule
const createSchedule = useMutation({
  mutationFn: async (schedule: NewSchedule) => {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        ...schedule,
        created_by: user.id, // from auth context
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
})

// Similar for update, delete, toggle active
```

### Step 3: Configure Email Service Provider

Choose and configure an email provider in the Edge Function:

**Option A: Resend (Recommended)**

1. Sign up at https://resend.com
2. Get API key
3. Add to Supabase environment variables:
   ```bash
   supabase secrets set RESEND_API_KEY=your_api_key
   ```
4. Uncomment Resend code in `send-scheduled-reports/index.ts` (lines 249-269)
5. Configure sender domain and email

**Option B: SendGrid**

```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
  },
  body: JSON.stringify({
    personalizations: [{
      to: to.map(email => ({ email })),
    }],
    from: { email: 'reports@inlight.hu' },
    subject: subject,
    content: [{ type: 'text/html', value: html }],
  }),
})
```

**Option C: Gmail SMTP**

Use `deno-smtp` library for SMTP integration.

### Step 4: Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy send-scheduled-reports

# Set required environment variables
supabase secrets set RESEND_API_KEY=your_api_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 5: Schedule Periodic Execution

**Option A: Supabase Cron (Coming Soon)**

Wait for Supabase native cron support.

**Option B: GitHub Actions**

Create `.github/workflows/scheduled-reports.yml`:

```yaml
name: Send Scheduled Reports

on:
  schedule:
    # Run every hour
    - cron: '0 * * * *'

jobs:
  send-reports:
    runs-on: ubuntu-latest
    steps:
      - name: Invoke Edge Function
        run: |
          curl -X POST \
            https://your-project.supabase.co/functions/v1/send-scheduled-reports \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

**Option C: External Cron Service**

Use cron-job.org, EasyCron, or similar to hit the Edge Function endpoint hourly.

**Option D: Vercel Cron (if using Vercel)**

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/trigger-reports",
    "schedule": "0 * * * *"
  }]
}
```

Create `/api/trigger-reports/route.ts`:

```typescript
export async function GET() {
  const response = await fetch(
    'https://your-project.supabase.co/functions/v1/send-scheduled-reports',
    {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    }
  )
  return Response.json(await response.json())
}
```

### Step 6: Enhance Email Templates

Current template supports rentals report. Add templates for other report types:

**In `generateEmailHTML()` function:**

```typescript
switch (report.report_type) {
  case 'rentals':
    return generateRentalsEmail(data)
  case 'clients':
    return generateClientsEmail(data)
  case 'products':
    return generateProductsEmail(data)
  case 'revenue':
    return generateRevenueEmail(data)
  case 'profit':
    return generateProfitEmail(data)
  case 'comparison':
    return generateComparisonEmail(data)
}
```

### Step 7: Add Report Generation for Other Types

Currently only `rentals` report generation is implemented. Add logic for:

**In `generateReportData()` function:**

- `clients`: Aggregate rental data by client
- `products`: Product utilization statistics
- `revenue`: Revenue breakdown by period
- `profit`: Subrental profit calculations
- `comparison`: Rental vs subrental comparison

### Step 8: Testing

1. **Local Testing:**
   ```bash
   # Run Edge Function locally
   supabase functions serve send-scheduled-reports

   # Trigger manually
   curl -X POST http://localhost:54321/functions/v1/send-scheduled-reports
   ```

2. **Create Test Schedules:**
   - Create schedules with different report types
   - Test pause/resume functionality
   - Verify email generation (check logs initially)

3. **Production Testing:**
   - Start with a single test schedule to your own email
   - Verify HTML rendering in different email clients
   - Check spam filters
   - Monitor Edge Function logs

### Step 9: Monitoring & Logging

Add monitoring to track:
- Successful email sends
- Failed emails (with retry logic)
- Edge Function execution time
- Database queries performance

**Recommended Tools:**
- Sentry for error tracking
- LogTail/Better Stack for logs
- Supabase Dashboard for function metrics

---

## 📁 Files Created/Modified

### New Files

1. `src/components/reports/AdvancedFilters.tsx` - Advanced filtering component
2. `src/components/reports/ReportScheduler.tsx` - Email scheduling UI
3. `supabase/migrations/20250103000017_create_scheduled_reports.sql` - Database schema
4. `supabase/functions/send-scheduled-reports/index.ts` - Edge Function for email delivery
5. `docs/M3_REPORTS_ENHANCEMENTS.md` - This documentation

### Modified Files

1. `src/pages/Reports.tsx` - Integrated AdvancedFilters and ReportScheduler
2. `src/components/reports/RentalReportView.tsx` - Implemented client-side filtering
3. `src/i18n/locales/en.json` - Added English translations
4. `src/i18n/locales/hu.json` - Added Hungarian translations

---

## 🔍 Architecture Decisions

### Why localStorage for Schedules (Current)?

**Pros:**
- ✅ Zero backend setup required
- ✅ Immediate functionality
- ✅ No additional database queries
- ✅ Perfect for POC/demo

**Cons:**
- ❌ Not shared across devices
- ❌ Lost on browser cache clear
- ❌ Can't be triggered server-side

**Migration Path:** Easy 1-2 hour task to switch to Supabase.

### Why Supabase Edge Functions for Email?

**Alternatives Considered:**
1. **Client-side email sending** - Security risk (exposes API keys)
2. **Scheduled frontend jobs** - Not reliable (requires browser to be open)
3. **Third-party automation** - Additional cost, less control

**Edge Functions Chosen Because:**
- ✅ Server-side execution (secure)
- ✅ Access to full database
- ✅ Scalable and reliable
- ✅ Part of existing Supabase stack

### Report Data Generation Strategy

**Hybrid Approach:**
- Server-side: Date and status filtering (efficient database queries)
- Client-side: Text search and amount filtering (no database schema changes)

**Why?**
- Avoids complex migration for full-text search
- Keeps database queries simple
- Acceptable performance for report sizes (<1000 records)

**Future Optimization:**
- Add database indexes for common filters
- Implement PostgreSQL full-text search for product/client
- Consider materialized views for complex reports

---

## 💡 Usage Guide for End Users

### Creating a Scheduled Report

1. Navigate to **Reports** page
2. Select desired report type (e.g., Rentals)
3. Configure filters in **Advanced Filters** section
4. Scroll to **Scheduled Reports** section
5. Click **New Schedule**
6. Fill in:
   - Schedule name (e.g., "Weekly Active Rentals")
   - Report type (auto-filled from current selection)
   - Recurrence (daily/weekly/monthly)
   - Recipients (add email addresses)
   - Filters (use current or customize)
7. Click **Create**

### Managing Schedules

- **Pause/Resume:** Click the pause/play icon
- **Edit:** Click the edit icon to modify schedule
- **Delete:** Click the trash icon (confirmation required)

### Saved Filters

1. Configure filters in **Advanced Filters**
2. Click **Save Filter**
3. Enter a descriptive name
4. Click **Save**

To apply a saved filter, click on its name in the **Saved Filters** section.

---

## 🐛 Known Limitations

1. **Product Search Filter:** Not implemented (requires backend changes)
2. **Email Templates:** Only rentals report fully styled
3. **Email Sending:** Placeholder (needs provider configuration)
4. **Schedule Storage:** localStorage (migration to Supabase recommended)
5. **Cron Execution:** Manual trigger only (needs scheduling setup)

---

## 📊 Performance Considerations

### Current Performance

- **Filter Operation:** O(n) client-side filtering - acceptable for <1000 records
- **Saved Filters:** Instant (localStorage)
- **Schedule Management:** Instant (localStorage)

### Production Recommendations

- Add pagination for large result sets
- Implement server-side filtering for better performance
- Cache report data for frequently accessed reports
- Use database indexes for filter columns

---

## 🔒 Security Notes

### Current Implementation

- ✅ RLS policies on `scheduled_reports` table
- ✅ Admin/super_admin only access
- ✅ Service role key in Edge Function (secure)
- ✅ No API keys exposed to frontend

### Production Checklist

- [ ] Configure email provider with proper SPF/DKIM records
- [ ] Validate recipient email addresses server-side
- [ ] Rate limit email sending per schedule
- [ ] Monitor for abuse (excessive schedules)
- [ ] Implement email unsubscribe mechanism (if required by law)
- [ ] Add CAPTCHA if schedule creation is exposed publicly

---

## 📞 Support & Questions

For questions or issues:
1. Check Edge Function logs: Supabase Dashboard → Edge Functions → Logs
2. Review migration status: `supabase migration list`
3. Test email service integration separately before full deployment

---

**Last Updated:** January 3, 2026
**Version:** 1.0.0
**Status:** ✅ Development Complete, ⏳ Production Deployment Pending
