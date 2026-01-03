import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledReport {
  id: string
  name: string
  report_type: 'rentals' | 'clients' | 'products' | 'revenue' | 'profit' | 'comparison'
  recurrence: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  filters: any
  next_run: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch scheduled reports that are due
    const now = new Date().toISOString()
    const { data: reports, error: fetchError } = await supabaseClient
      .from('scheduled_reports')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now)
      .order('next_run', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled reports: ${fetchError.message}`)
    }

    console.log(`Found ${reports?.length || 0} scheduled reports to process`)

    const results = []

    // Process each scheduled report
    for (const report of reports || []) {
      try {
        console.log(`Processing report: ${report.name} (${report.id})`)

        // Generate report data based on type
        const reportData = await generateReportData(supabaseClient, report)

        // Generate HTML email
        const htmlEmail = generateEmailHTML(report, reportData)

        // Send email to all recipients
        const emailResult = await sendEmail({
          to: report.recipients,
          subject: `${report.name} - ${new Date().toLocaleDateString()}`,
          html: htmlEmail,
        })

        if (emailResult.success) {
          // Update next_run date
          const { error: updateError } = await supabaseClient.rpc('update_next_run', {
            schedule_id: report.id
          })

          if (updateError) {
            console.error(`Failed to update next_run for report ${report.id}:`, updateError)
          }

          results.push({
            id: report.id,
            name: report.name,
            status: 'sent',
            recipients: report.recipients.length,
          })
        } else {
          results.push({
            id: report.id,
            name: report.name,
            status: 'failed',
            error: emailResult.error,
          })
        }
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error)
        results.push({
          id: report.id,
          name: report.name,
          status: 'error',
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-scheduled-reports function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Generate report data based on report type and filters
async function generateReportData(supabaseClient: any, report: ScheduledReport) {
  const filters = report.filters || {}

  switch (report.report_type) {
    case 'rentals': {
      let query = supabaseClient
        .from('rentals')
        .select(`
          *,
          clients (name, email, company)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate)
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters.rentalType && filters.rentalType !== 'all') {
        query = query.eq('type', filters.rentalType)
      }

      const { data, error } = await query
      if (error) throw error

      // Apply client-side filters
      let filteredData = data || []
      if (filters.clientSearch) {
        const search = filters.clientSearch.toLowerCase()
        filteredData = filteredData.filter((r: any) =>
          r.clients?.name?.toLowerCase().includes(search)
        )
      }
      if (filters.minAmount) {
        filteredData = filteredData.filter((r: any) => r.final_total >= filters.minAmount)
      }
      if (filters.maxAmount) {
        filteredData = filteredData.filter((r: any) => r.final_total <= filters.maxAmount)
      }

      return filteredData
    }

    case 'clients': {
      // Similar implementation for client statistics
      // This would aggregate rental data by client
      return []
    }

    case 'products': {
      // Similar implementation for product utilization
      return []
    }

    case 'revenue': {
      // Similar implementation for revenue report
      return []
    }

    case 'profit': {
      // Similar implementation for profit report
      return []
    }

    case 'comparison': {
      // Similar implementation for comparison report
      return []
    }

    default:
      throw new Error(`Unknown report type: ${report.report_type}`)
  }
}

// Generate HTML email from report data
function generateEmailHTML(report: ScheduledReport, data: any[]): string {
  const reportTypeLabels: Record<string, string> = {
    rentals: 'Rentals Report',
    clients: 'Client Statistics',
    products: 'Product Utilization',
    revenue: 'Revenue Report',
    profit: 'Subrental Profit',
    comparison: 'Rental vs Subrental Comparison',
  }

  const title = reportTypeLabels[report.report_type] || report.report_type

  // Generate summary statistics
  const totalCount = data.length
  const totalRevenue = data.reduce((sum: number, item: any) => sum + (item.final_total || 0), 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${report.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .header p { margin: 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
        .summary-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #718096; text-transform: uppercase; }
        .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #2d3748; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        thead { background: #4a5568; color: white; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { font-weight: 600; text-transform: uppercase; font-size: 12px; }
        tbody tr:hover { background: #f7fafc; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .badge-active { background: #c6f6d5; color: #22543d; }
        .badge-completed { background: #bee3f8; color: #2c5282; }
        .badge-pending { background: #fef5e7; color: #975a16; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.name}</h1>
        <p>${title} • Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Records</h3>
          <p>${totalCount}</p>
        </div>
        ${report.report_type === 'rentals' || report.report_type === 'revenue' ? `
        <div class="summary-card">
          <h3>Total Revenue</h3>
          <p>€${totalRevenue.toFixed(2)}</p>
        </div>
        ` : ''}
      </div>

      ${report.report_type === 'rentals' ? generateRentalsTable(data) : ''}

      <div class="footer">
        <p>This is an automated report from iNLighT Rental Manager</p>
        <p>Scheduled ${report.recurrence} • Next run: ${new Date(report.next_run).toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `
}

function generateRentalsTable(rentals: any[]): string {
  if (rentals.length === 0) {
    return '<p style="text-align: center; color: #718096; padding: 40px;">No rentals found for this period</p>'
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Rental #</th>
          <th>Client</th>
          <th>Project</th>
          <th>Period</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rentals.map(rental => `
          <tr>
            <td style="font-family: monospace; font-weight: 600;">${rental.rental_number}</td>
            <td>${rental.clients?.name || 'N/A'}</td>
            <td>${rental.project_name || 'N/A'}</td>
            <td style="font-family: monospace; font-size: 12px;">
              ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}
            </td>
            <td>
              <span class="badge badge-${rental.status}">
                ${rental.status}
              </span>
            </td>
            <td style="font-family: monospace; font-weight: 600;">
              ${rental.final_currency} ${rental.final_total.toFixed(2)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Send email using email service provider
async function sendEmail({ to, subject, html }: { to: string[], subject: string, html: string }) {
  // TODO: Integrate with email service provider (Resend, SendGrid, etc.)
  // For now, this is a placeholder that logs the email

  console.log('Sending email:')
  console.log('To:', to.join(', '))
  console.log('Subject:', subject)
  console.log('HTML length:', html.length)

  // EXAMPLE: Using Resend (uncomment and configure when ready)
  /*
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'reports@inlight.hu',
      to: to,
      subject: subject,
      html: html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Email sending failed: ${error}`)
  }

  return { success: true }
  */

  // Placeholder response (simulates success)
  return { success: true }
}
