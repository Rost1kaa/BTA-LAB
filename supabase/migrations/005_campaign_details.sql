-- ═══════════════════════════════════════════════════════════════════════════
-- Campaign Details Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.campaign_details (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial placeholder data
INSERT INTO public.campaign_details (id, title, content) 
VALUES (
  1,
  'ბითიეი ლაბი (BTA LAB) — მეწარმეების ციფრული განვითარების მხარდაჭერა',
  'აქ გამოჩნდება შენ მიერ ადმინ პანელიდან შეყვანილი სრული ტექსტი...'
) 
ON CONFLICT (id) DO NOTHING;

-- Auto-update updated_at on row modification
CREATE TRIGGER campaign_details_set_updated_at
  BEFORE UPDATE ON public.campaign_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.campaign_details ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read campaign details"
  ON public.campaign_details
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access (for admin panel updates)
CREATE POLICY "Service role can manage campaign details"
  ON public.campaign_details
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
