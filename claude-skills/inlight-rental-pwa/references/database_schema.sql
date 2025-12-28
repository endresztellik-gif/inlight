-- FilmGear Rental Manager - Database Schema
-- Supabase PostgreSQL
-- iNLighT Kft.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_hu TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,                           -- Prepared for future use
  serial_number TEXT,                        -- Prepared for future use
  qr_code TEXT,                              -- Prepared for future use
  name_en TEXT NOT NULL,
  name_hu TEXT NOT NULL,
  description_en TEXT,
  description_hu TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  rental_type TEXT CHECK (rental_type IN ('rental', 'subrental', 'both')) DEFAULT 'rental',
  own_stock INTEGER DEFAULT 0,               -- Only relevant for rental type
  is_public BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  daily_rate DECIMAL(10,2),                  -- INFORMATIONAL ONLY!
  daily_rate_currency TEXT DEFAULT 'EUR' CHECK (daily_rate_currency IN ('EUR', 'HUF', 'USD')),
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_rental_type ON products(rental_type);
CREATE INDEX idx_products_public ON products(is_public) WHERE is_public = true;

-- ============================================
-- PRODUCT COMPONENTS (Parent-Child relationship)
-- ============================================
CREATE TABLE product_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  component_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  default_quantity INTEGER DEFAULT 1,
  has_own_stock BOOLEAN DEFAULT false,       -- If true, component has its own inventory
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_product_id, component_product_id)
);

CREATE INDEX idx_product_components_parent ON product_components(parent_product_id);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_company ON clients(company);

-- ============================================
-- RENTALS
-- ============================================
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_number TEXT UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  rental_type TEXT CHECK (rental_type IN ('rental', 'subrental')) NOT NULL,
  project_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT CHECK (status IN ('draft', 'active', 'overdue', 'returned', 'cancelled')) DEFAULT 'draft',
  -- Custom pricing (manually entered)
  final_total DECIMAL(12,2),
  final_currency TEXT DEFAULT 'EUR' CHECK (final_currency IN ('EUR', 'HUF', 'USD')),
  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 2,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rentals_client ON rentals(client_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX idx_rentals_type ON rentals(rental_type);

-- Auto-generate rental number
CREATE OR REPLACE FUNCTION generate_rental_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rental_number IS NULL THEN
    NEW.rental_number := 'R-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(NEXTVAL('rental_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS rental_number_seq START 1;

CREATE TRIGGER set_rental_number
  BEFORE INSERT ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION generate_rental_number();

-- ============================================
-- RENTAL ITEMS
-- ============================================
CREATE TABLE rental_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_components UUID[] DEFAULT '{}',
  return_status TEXT CHECK (return_status IN ('pending', 'returned', 'partial')) DEFAULT 'pending',
  return_condition TEXT CHECK (return_condition IN ('ok', 'damaged', 'missing_parts')),
  return_notes TEXT,
  returned_quantity INTEGER DEFAULT 0,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX idx_rental_items_product ON rental_items(product_id);

-- ============================================
-- RENTAL ITEM SUPPLIERS (for Subrental tracking)
-- ============================================
-- One rental item can have multiple suppliers
-- Example: 10 lamps - 6 from Supplier A, 4 from Supplier B
CREATE TABLE rental_item_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_item_id UUID REFERENCES rental_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  supplier_cost DECIMAL(10,2),
  supplier_currency TEXT DEFAULT 'EUR' CHECK (supplier_currency IN ('EUR', 'HUF', 'USD')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_item_suppliers_item ON rental_item_suppliers(rental_item_id);
CREATE INDEX idx_rental_item_suppliers_supplier ON rental_item_suppliers(supplier_id);

-- ============================================
-- INVENTORY LOGS
-- ============================================
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
  action TEXT CHECK (action IN ('rent_out', 'return', 'adjust', 'add', 'remove')) NOT NULL,
  quantity_change INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_date ON inventory_logs(created_at);

-- ============================================
-- SUPPLIER (for Subrental)
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suppliers_name ON suppliers(name);

-- ============================================
-- USER PROFILES (for role management)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Role permissions:
-- super_admin: Full access (products, categories, exports, handover docs, user management)
-- admin: Rental operations only (create/edit rentals, returns, view inventory)

-- ============================================
-- VIEWS
-- ============================================

-- Current Stock View
CREATE OR REPLACE VIEW current_stock_view AS
SELECT 
  p.id,
  p.sku,
  p.name_en,
  p.name_hu,
  p.own_stock,
  p.own_stock - COALESCE(
    (SELECT SUM(ri.quantity - ri.returned_quantity)
     FROM rental_items ri
     JOIN rentals r ON ri.rental_id = r.id
     WHERE ri.product_id = p.id 
       AND r.rental_type = 'rental'
       AND r.status IN ('active', 'overdue')
       AND ri.return_status != 'returned'
    ), 0
  )::INTEGER AS available_stock,
  p.rental_type,
  c.name_en AS category_name_en,
  c.name_hu AS category_name_hu
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.rental_type IN ('rental', 'both');

-- Active Rentals View
CREATE OR REPLACE VIEW active_rentals_view AS
SELECT 
  r.id,
  r.rental_number,
  r.rental_type,
  r.project_name,
  r.start_date,
  r.end_date,
  r.status,
  c.name AS client_name,
  c.company AS client_company,
  COUNT(ri.id) AS item_count,
  r.created_at
FROM rentals r
LEFT JOIN clients c ON r.client_id = c.id
LEFT JOIN rental_items ri ON r.id = ri.rental_id
WHERE r.status IN ('active', 'overdue')
GROUP BY r.id, c.name, c.company;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get Future Availability
CREATE OR REPLACE FUNCTION get_future_availability(
  p_product_id UUID,
  p_target_date DATE
) RETURNS INTEGER AS $$
DECLARE
  base_stock INTEGER;
  currently_rented INTEGER;
  returning_before INTEGER;
BEGIN
  -- Base stock
  SELECT own_stock INTO base_stock
  FROM products WHERE id = p_product_id;
  
  IF base_stock IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Currently rented out
  SELECT COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) INTO currently_rented
  FROM rental_items ri
  JOIN rentals r ON ri.rental_id = r.id
  WHERE ri.product_id = p_product_id
    AND r.rental_type = 'rental'
    AND r.status IN ('active', 'overdue')
    AND ri.return_status != 'returned';
  
  -- Items returning before target date
  SELECT COALESCE(SUM(ri.quantity - ri.returned_quantity), 0) INTO returning_before
  FROM rental_items ri
  JOIN rentals r ON ri.rental_id = r.id
  WHERE ri.product_id = p_product_id
    AND r.rental_type = 'rental'
    AND r.status IN ('active', 'overdue')
    AND ri.return_status != 'returned'
    AND r.end_date <= p_target_date;
  
  RETURN base_stock - currently_rented + returning_before;
END;
$$ LANGUAGE plpgsql;

-- Get Weekly Movement Report
CREATE OR REPLACE FUNCTION get_weekly_movement(
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '7 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  product_id UUID,
  product_name_en TEXT,
  product_name_hu TEXT,
  rented_out INTEGER,
  returned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name_en,
    p.name_hu,
    COALESCE(SUM(CASE WHEN il.action = 'rent_out' THEN ABS(il.quantity_change) ELSE 0 END), 0)::INTEGER AS rented_out,
    COALESCE(SUM(CASE WHEN il.action = 'return' THEN ABS(il.quantity_change) ELSE 0 END), 0)::INTEGER AS returned
  FROM products p
  LEFT JOIN inventory_logs il ON p.id = il.product_id 
    AND il.created_at >= p_start_date 
    AND il.created_at < p_end_date + INTERVAL '1 day'
  GROUP BY p.id, p.name_en, p.name_hu
  HAVING SUM(ABS(COALESCE(il.quantity_change, 0))) > 0
  ORDER BY p.name_en;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Public products policy (for unauthenticated access)
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (is_public = true);

-- Authenticated users can see all products
CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage products
CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Similar policies for other tables (authenticated only)
CREATE POLICY "Authenticated access" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON product_components FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON rentals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON rental_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON inventory_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
