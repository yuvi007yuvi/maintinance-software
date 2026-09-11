-- ==============================================================================
-- NAGAR NIGAM ALIGARH - VEHICLE WORKSHOP & FLEET MANAGEMENT SYSTEM (VWFMS)
-- Database Schema: PostgreSQL / Supabase
-- Target Supabase URL: https://ogzwkbhlzooblecqjowf.supabase.co
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ZONES & WARDS (Municipal Boundaries)
CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS wards (
    id TEXT PRIMARY KEY,
    ward_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
    sanitation_inspector TEXT,
    contact_number TEXT
);

-- 2. USERS & ROLES
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'nagar_nigam_officer',
    'project_manager',
    'fleet_manager',
    'workshop_manager',
    'mechanic',
    'driver'
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'driver',
    zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLE MASTER
CREATE TYPE vehicle_status AS ENUM (
    'Available',
    'Running',
    'Deployed',
    'Breakdown',
    'Under Inspection',
    'Under Repair',
    'Awaiting Spare Parts',
    'Ready for Deployment',
    'Inactive',
    'Scrapped'
);

CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL, -- e.g. UP81 BT 1024
    vehicle_type TEXT NOT NULL,               -- e.g. Refuse Compactor, Dumper Placer, Tipper, JCB, Sewer Jetting Machine
    category TEXT NOT NULL,                   -- Heavy, Medium, Light Sanitation, Special Equipment
    make TEXT NOT NULL,                       -- Tata, Ashok Leyland, Mahindra, JCB
    model TEXT NOT NULL,
    manufacturing_year INTEGER NOT NULL,
    fuel_type TEXT NOT NULL DEFAULT 'Diesel', -- Diesel, CNG, Electric
    engine_number TEXT,
    chassis_number TEXT,
    capacity TEXT,                            -- e.g. 8 Ton, 14 CBM, 3000 Litres
    ownership_type TEXT DEFAULT 'Municipal Owned', -- Municipal Owned, Contractual, SBM
    status vehicle_status NOT NULL DEFAULT 'Available',
    assigned_zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
    assigned_ward_id TEXT REFERENCES wards(id) ON DELETE SET NULL,
    assigned_driver_id TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    purchase_date DATE,
    insurance_expiry DATE,
    fitness_expiry DATE,
    puc_expiry DATE,
    permit_expiry DATE,
    current_odometer_km NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKSHOPS
CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER DEFAULT 15,
    manager_id TEXT REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- 5. BREAKDOWNS
CREATE TYPE breakdown_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE breakdown_status AS ENUM (
    'Reported',
    'Acknowledged',
    'Vehicle Collected',
    'Workshop Received',
    'Diagnosis',
    'Repair',
    'Inspection',
    'Completed',
    'Field Redeployment'
);

CREATE TABLE IF NOT EXISTS breakdowns (
    id TEXT PRIMARY KEY,
    breakdown_number TEXT UNIQUE NOT NULL,
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    reported_by TEXT NOT NULL,
    location TEXT NOT NULL,
    ward_id TEXT REFERENCES wards(id) ON DELETE SET NULL,
    breakdown_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    problem_category TEXT NOT NULL, -- Engine, Hydraulic System, Brakes, Transmission, Electrical, Tire, Suspension
    problem_description TEXT NOT NULL,
    severity breakdown_severity NOT NULL DEFAULT 'High',
    vehicle_condition TEXT,
    photo_url TEXT,
    status breakdown_status NOT NULL DEFAULT 'Reported',
    acknowledged_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    workshop_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOB CARDS
CREATE TYPE job_card_status AS ENUM (
    'Open',
    'Assigned',
    'Diagnosis',
    'Repair',
    'Inspection',
    'Approved',
    'Closed'
);

CREATE TABLE IF NOT EXISTS job_cards (
    id TEXT PRIMARY KEY,
    job_card_number TEXT UNIQUE NOT NULL, -- e.g. JC-2026-0012
    breakdown_id TEXT REFERENCES breakdowns(id) ON DELETE SET NULL,
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    workshop_id TEXT REFERENCES workshops(id) ON DELETE SET NULL,
    complaint TEXT NOT NULL,
    diagnosis TEXT,
    required_repair TEXT,
    assigned_mechanic_id TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    work_started_at TIMESTAMPTZ,
    work_completed_at TIMESTAMPTZ,
    inspection_status TEXT DEFAULT 'Pending', -- Pending, Passed, Rework Required
    inspection_remarks TEXT,
    inspected_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    approved_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    status job_card_status NOT NULL DEFAULT 'Open',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SPARE PARTS & INVENTORY
CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    part_name TEXT NOT NULL,
    part_number TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- Engine, Hydraulics, Brakes, Suspension, Electrical, Consumables
    compatible_vehicle_types TEXT,
    unit TEXT NOT NULL DEFAULT 'Nos', -- Nos, Litres, Sets, Metres
    opening_stock NUMERIC NOT NULL DEFAULT 0,
    current_stock NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 5, -- Low stock trigger threshold
    supplier TEXT,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_card_parts (
    id TEXT PRIMARY KEY,
    job_card_id TEXT REFERENCES job_cards(id) ON DELETE CASCADE,
    part_id TEXT REFERENCES parts(id) ON DELETE RESTRICT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    issued_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    part_id TEXT REFERENCES parts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'purchase', 'issue', 'return', 'adjustment'
    quantity NUMERIC NOT NULL,
    reference_id TEXT, -- job_card_id or PO number
    remarks TEXT,
    performed_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FIELD REDEPLOYMENT (STANDBY FLEET TRACKING)
CREATE TABLE IF NOT EXISTS redeployments (
    id TEXT PRIMARY KEY,
    original_vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    replacement_vehicle_id TEXT REFERENCES vehicles(id) ON DELETE RESTRICT,
    ward_id TEXT REFERENCES wards(id) ON DELETE SET NULL,
    zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
    deployment_location TEXT NOT NULL,
    assigned_driver_id TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    deployment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    release_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Released'
    approved_by TEXT REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MAINTENANCE SCHEDULES (Preventive & Corrective)
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL DEFAULT 'Preventive', -- Preventive, Corrective
    title TEXT NOT NULL,
    description TEXT,
    interval_km NUMERIC,
    interval_days INTEGER,
    last_service_date DATE,
    next_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled', -- Scheduled, Overdue, In Progress, Completed
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DOWNTIME LOGS
CREATE TABLE IF NOT EXISTS downtime_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    breakdown_id TEXT REFERENCES breakdowns(id) ON DELETE SET NULL,
    job_card_id TEXT REFERENCES job_cards(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_downtime_hours NUMERIC,
    cause_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT TRAIL
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performed_by_role TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Automatically update parts stock and calculate job card actual cost
CREATE OR REPLACE FUNCTION update_inventory_on_job_part()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock from parts
    UPDATE parts
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.part_id;

    -- Record inventory transaction
    INSERT INTO inventory_transactions (id, part_id, transaction_type, quantity, reference_id, remarks, created_at)
    VALUES (
        'TXN-' || substr(md5(random()::text), 1, 10),
        NEW.part_id,
        'issue',
        NEW.quantity,
        NEW.job_card_id,
        'Issued to Job Card ' || NEW.job_card_id,
        NOW()
    );

    -- Update job card actual cost
    UPDATE job_cards
    SET actual_cost = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM job_card_parts
        WHERE job_card_id = NEW.job_card_id
    )
    WHERE id = NEW.job_card_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_part_inventory ON job_card_parts;
CREATE TRIGGER trg_job_part_inventory
AFTER INSERT ON job_card_parts
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_job_part();

-- Automatically calculate downtime when Job Card is closed
CREATE OR REPLACE FUNCTION log_downtime_on_job_card_close()
RETURNS TRIGGER AS $$
DECLARE
    v_breakdown breakdowns%ROWTYPE;
    v_hours NUMERIC;
BEGIN
    IF NEW.status = 'Closed' AND OLD.status <> 'Closed' THEN
        NEW.closed_at := COALESCE(NEW.closed_at, NOW());
        
        -- Get breakdown start time if linked
        IF NEW.breakdown_id IS NOT NULL THEN
            SELECT * INTO v_breakdown FROM breakdowns WHERE id = NEW.breakdown_id;
            IF v_breakdown.breakdown_date IS NOT NULL THEN
                v_hours := ROUND(EXTRACT(EPOCH FROM (NEW.closed_at - v_breakdown.breakdown_date)) / 3600.0, 2);
                
                INSERT INTO downtime_logs (id, vehicle_id, breakdown_id, job_card_id, start_time, end_time, total_downtime_hours, cause_category)
                VALUES (
                    'DT-' || substr(md5(random()::text), 1, 10),
                    NEW.vehicle_id,
                    NEW.breakdown_id,
                    NEW.id,
                    v_breakdown.breakdown_date,
                    NEW.closed_at,
                    v_hours,
                    v_breakdown.problem_category
                );

                -- Update vehicle status back to Ready for Deployment or Available
                UPDATE vehicles SET status = 'Ready for Deployment', updated_at = NOW() WHERE id = NEW.vehicle_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_card_close_downtime ON job_cards;
CREATE TRIGGER trg_job_card_close_downtime
BEFORE UPDATE ON job_cards
FOR EACH ROW
EXECUTE FUNCTION log_downtime_on_job_card_close();
