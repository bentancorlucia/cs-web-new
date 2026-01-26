-- Functions for stock management

-- Decrement variant stock
CREATE OR REPLACE FUNCTION decrement_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE variantes_producto
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement product stock (for products without variants)
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE productos
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment variant stock (for order cancellations/returns)
CREATE OR REPLACE FUNCTION increment_variant_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE variantes_producto
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product stock (for order cancellations/returns)
CREATE OR REPLACE FUNCTION increment_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE productos
  SET stock = stock + p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and alert low stock (called by trigger after stock update)
CREATE OR REPLACE FUNCTION check_low_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_product_name TEXT;
  v_threshold INTEGER := 5; -- Default threshold
BEGIN
  -- Only check if stock decreased
  IF NEW.stock < OLD.stock AND NEW.stock <= v_threshold THEN
    -- Get product name for logging
    IF TG_TABLE_NAME = 'variantes_producto' THEN
      SELECT p.nombre INTO v_product_name
      FROM productos p
      WHERE p.id = NEW.producto_id;

      RAISE NOTICE 'Low stock alert: % (variant %) - only % remaining',
        v_product_name, NEW.id, NEW.stock;
    ELSE
      RAISE NOTICE 'Low stock alert: % - only % remaining',
        NEW.nombre, NEW.stock;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for low stock alerts
DROP TRIGGER IF EXISTS trigger_low_stock_product ON productos;
CREATE TRIGGER trigger_low_stock_product
  AFTER UPDATE OF stock ON productos
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_alert();

DROP TRIGGER IF EXISTS trigger_low_stock_variant ON variantes_producto;
CREATE TRIGGER trigger_low_stock_variant
  AFTER UPDATE OF stock ON variantes_producto
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_alert();
