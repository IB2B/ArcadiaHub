-- ============================================
-- Access Requests Table
-- Stores partner access requests before approval
-- ============================================

CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Personal Information
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_description TEXT NOT NULL,
  contact_photo_url TEXT,

  -- Company Information
  company_name TEXT NOT NULL,
  legal_address TEXT NOT NULL,
  operational_address TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  generic_email TEXT NOT NULL,
  pec TEXT NOT NULL,
  company_description TEXT NOT NULL,
  company_logo_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create an access request (unauthenticated)
CREATE POLICY "Anyone can create access request" ON access_requests
  FOR INSERT WITH CHECK (true);

-- Only admins and commercials can view access requests
CREATE POLICY "Staff can view access requests" ON access_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'COMMERCIAL')
    )
  );

-- Only admins can update access requests
CREATE POLICY "Admins can update access requests" ON access_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Index for status filtering
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_created_at ON access_requests(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
