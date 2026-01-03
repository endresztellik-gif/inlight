-- Add damage_description field to rental_items table
-- For tracking damage details when condition_on_return is 'damaged'

ALTER TABLE rental_items
ADD COLUMN damage_description VARCHAR(200);

COMMENT ON COLUMN rental_items.damage_description IS 'Damage description (max 200 chars) when condition_on_return is damaged';
