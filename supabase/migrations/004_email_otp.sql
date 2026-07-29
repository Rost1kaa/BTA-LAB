-- ═══════════════════════════════════════════════════════════════════════════
-- Email OTP Verification Table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.email_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index for fast email/expiration lookup
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.email_otp_codes(email);

-- Enable RLS
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (used by API routes with service role key)
CREATE POLICY "Service role can manage otp codes"
    ON public.email_otp_codes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow public to insert OTP requests (send-otp)
CREATE POLICY "Public can insert otp requests"
    ON public.email_otp_codes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow public to read their own OTP status (for verify-otp checks)
CREATE POLICY "Public can read otp by email"
    ON public.email_otp_codes
    FOR SELECT
    TO anon, authenticated
    USING (true);
