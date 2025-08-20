-- Seed regional pricing data
INSERT INTO public.regional_pricing (region, currency, price_per_point) VALUES 
('Europe', 'EUR', 0.05),
('India', 'INR', 3.00)
ON CONFLICT (region) DO UPDATE SET
  price_per_point = EXCLUDED.price_per_point,
  currency = EXCLUDED.currency,
  updated_at = now();