-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  final_total DECIMAL(10, 2),
  final_currency VARCHAR(3) DEFAULT 'EUR' CHECK (final_currency IN ('EUR', 'HUF', 'USD')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_days_before INTEGER DEFAULT 2,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_rentals_client_id ON rentals(client_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_start_date ON rentals(start_date);
CREATE INDEX idx_rentals_end_date ON rentals(end_date);
CREATE INDEX idx_rentals_rental_number ON rentals(rental_number);

-- Add comment
COMMENT ON TABLE rentals IS 'Main rental transactions for own inventory equipment';
