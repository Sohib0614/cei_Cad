-- =============================================================================
-- CEI ESTIMATION LLC - ENTERPRISE POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Application: Precision CAD Takeoff & Architectural Estimating Platform
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS cei_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users(id) in Supabase
    name VARCHAR(255) NOT NULL,
    claim_number VARCHAR(100),
    job_number VARCHAR(100),
    site_address TEXT,
    date_of_loss DATE,
    due_date DATE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'Roofing', -- 'Roofing', 'RoofScopeX', 'Siding', 'Gutter', 'RoofingGutter', 'Concrete', 'Insulation', 'Paint'
    status VARCHAR(50) NOT NULL DEFAULT 'New', -- 'New', 'In_Progress', 'Inspected', 'Completed', 'Failed'
    primary_pitch VARCHAR(20) DEFAULT '6/12',
    notes TEXT,
    has_read_notes BOOLEAN DEFAULT TRUE,
    which_north_angle_deg NUMERIC(5, 2) DEFAULT 0,
    plan_name VARCHAR(255),
    plan_url TEXT,
    scale_calibration JSONB DEFAULT '{"isCalibrated": true, "pixelsPerFoot": 12.0, "knownLengthFt": 50, "scaleLabel": "1\" = 10\'"}',
    total_footprint_sqft NUMERIC(12, 2) DEFAULT 0,
    total_true_area_sqft NUMERIC(12, 2) DEFAULT 0,
    total_squares NUMERIC(10, 2) DEFAULT 0,
    qc_time_seconds INTEGER DEFAULT 0,
    tech_time_seconds INTEGER DEFAULT 0,
    revision INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user project lookups
CREATE INDEX IF NOT EXISTS idx_cei_projects_user_id ON cei_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_cei_projects_status ON cei_projects(status);
CREATE INDEX IF NOT EXISTS idx_cei_projects_product_type ON cei_projects(product_type);

-- 2. Facets / Roof Planes Table
CREATE TABLE IF NOT EXISTS cei_facets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES cei_projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    structure VARCHAR(100) DEFAULT 'Main Building',
    pitch VARCHAR(20) DEFAULT '6/12',
    elevation_side VARCHAR(20), -- 'North', 'South', 'East', 'West', 'Overhead'
    footprint_area_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
    true_area_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
    squares NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_high_roof BOOLEAN DEFAULT FALSE,
    vertices JSONB NOT NULL, -- [[x1, y1], [x2, y2], ...] in world feet coordinates
    cutouts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cei_facets_project_id ON cei_facets(project_id);

-- 3. Classified Edges Table
CREATE TABLE IF NOT EXISTS cei_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES cei_projects(id) ON DELETE CASCADE,
    facet_id UUID REFERENCES cei_facets(id) ON DELETE SET NULL,
    edge_type VARCHAR(50) NOT NULL, -- 'Eave', 'Ridge', 'Hip', 'Valley', 'Rake', 'StepFlashing', 'HeadwallFlashing', 'Parapet', 'Gutter', 'Downspout', 'CornerTrim', 'FasciaTrim', 'StarterStrip'
    length_ft NUMERIC(10, 2) NOT NULL,
    p1 JSONB NOT NULL, -- [x1, y1]
    p2 JSONB NOT NULL, -- [x2, y2]
    slope VARCHAR(20),
    structure VARCHAR(100) DEFAULT 'Main Building',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cei_edges_project_id ON cei_edges(project_id);
CREATE INDEX IF NOT EXISTS idx_cei_edges_type ON cei_edges(edge_type);

-- 4. Punch Items / Accessories Table
CREATE TABLE IF NOT EXISTS cei_punch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES cei_projects(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'PipeBoot', 'BoxVent', 'HVAC_Curb', 'DownspoutDrop', 'Endcap', 'InsideCorner', 'OutsideCorner', 'DownspoutElbow'
    position JSONB NOT NULL, -- [x, y]
    label VARCHAR(150) NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cei_punch_items_project_id ON cei_punch_items(project_id);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE cei_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cei_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cei_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cei_punch_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view & edit their own projects
CREATE POLICY "Users can manage their own CEI projects" 
ON cei_projects 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Facets cascade with project ownership
CREATE POLICY "Users can manage facets of their projects" 
ON cei_facets 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM cei_projects 
        WHERE cei_projects.id = cei_facets.project_id 
        AND (cei_projects.user_id = auth.uid() OR cei_projects.user_id IS NULL)
    )
);

-- Edges cascade with project ownership
CREATE POLICY "Users can manage edges of their projects" 
ON cei_edges 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM cei_projects 
        WHERE cei_projects.id = cei_edges.project_id 
        AND (cei_projects.user_id = auth.uid() OR cei_projects.user_id IS NULL)
    )
);

-- Punch items cascade with project ownership
CREATE POLICY "Users can manage punch items of their projects" 
ON cei_punch_items 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM cei_projects 
        WHERE cei_projects.id = cei_punch_items.project_id 
        AND (cei_projects.user_id = auth.uid() OR cei_projects.user_id IS NULL)
    )
);

