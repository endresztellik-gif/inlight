-- Update clients table to add missing fields and improve schema

-- Add company field
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- Replace single contact_person with separate fields
ALTER TABLE clients DROP COLUMN IF EXISTS contact_person;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person_email VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person_phone VARCHAR(50);

-- Create index on company name for faster searches
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

COMMENT ON COLUMN clients.company IS 'Company name of the client';
COMMENT ON COLUMN clients.contact_person_name IS 'Name of the contact person at the company';
COMMENT ON COLUMN clients.contact_person_email IS 'Email of the contact person';
COMMENT ON COLUMN clients.contact_person_phone IS 'Phone number of the contact person';
