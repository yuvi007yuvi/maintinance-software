-- ==============================================================================
-- NAGAR NIGAM ALIGARH - VEHICLE WORKSHOP & FLEET MANAGEMENT SYSTEM (VWFMS)
-- Seed Data: Nagar Nigam Aligarh / Swachh Bharat Mission Fleet
-- ==============================================================================

-- 1. ZONES
INSERT INTO zones (id, name, code, description) VALUES
('zone-1', 'Civil Lines Zone', 'ZN-CL', 'North Aligarh administrative & residential sectors'),
('zone-2', 'Bannadevi Zone', 'ZN-BD', 'Industrial area, commercial markets and GT Road corridor'),
('zone-3', 'Sasni Gate Zone', 'ZN-SG', 'Historic core, dense heritage wards and old markets'),
('zone-4', 'Kwansi Zone', 'ZN-KW', 'South & eastern expanding residential colonies and bypass')
ON CONFLICT (id) DO NOTHING;

-- 2. WARDS
INSERT INTO wards (id, ward_number, name, zone_id, sanitation_inspector, contact_number) VALUES
('ward-1', 1, 'Dodhpur & Medical Road', 'zone-1', 'Rajesh Sharma', '+91 94123 88101'),
('ward-2', 2, 'Kishanpur & Ramghat Road', 'zone-1', 'Vikram Singh', '+91 94123 88102'),
('ward-3', 3, 'Marris Road & Centre Point', 'zone-1', 'Anil Kumar', '+91 94123 88103'),
('ward-4', 4, 'Bannadevi Industrial Area', 'zone-2', 'Suresh Chandra', '+91 94123 88104'),
('ward-5', 5, 'Sarsol & GT Road', 'zone-2', 'Pramod Yadav', '+91 94123 88105'),
('ward-6', 6, 'Sasni Gate Main Market', 'zone-3', 'Manoj Gupta', '+91 94123 88106'),
('ward-7', 7, 'Delhi Gate & Achal Tal', 'zone-3', 'Mohd. Imran', '+91 94123 88107'),
('ward-8', 8, 'Kwansi Bypass & Surendra Nagar', 'zone-4', 'Dinesh Kumar', '+91 94123 88108'),
('ward-9', 9, 'Etah Chungi & Hem Chand Compound', 'zone-4', 'Sunil Verma', '+91 94123 88109'),
('ward-10', 10, 'Shah Jamal & Railway Station', 'zone-3', 'Abdul Qadir', '+91 94123 88110')
ON CONFLICT (id) DO NOTHING;

-- 3. USER PROFILES
INSERT INTO user_profiles (id, full_name, email, phone, role, zone_id) VALUES
('usr-admin', 'Er. Arvind Saxena', 'admin@nagarnigamaligarh.in', '+91 94120 00001', 'super_admin', 'zone-1'),
('usr-officer', 'Dr. Amit Pathak (IAS)', 'commissioner@nagarnigamaligarh.in', '+91 94120 00002', 'nagar_nigam_officer', 'zone-1'),
('usr-pm', 'Devendra Rawat', 'pm.sbm@nagarnigamaligarh.in', '+91 94120 00003', 'project_manager', 'zone-1'),
('usr-fleet', 'Mahesh Chandra Varshney', 'fleet.mgr@nagarnigamaligarh.in', '+91 94120 00004', 'fleet_manager', 'zone-1'),
('usr-workshop', 'Rakesh Babu Sharma', 'workshop.chief@nagarnigamaligarh.in', '+91 94120 00005', 'workshop_manager', 'zone-2'),
('usr-mech-1', 'Kallu Mistri (Sr. Hyd)', 'kallu.mechanic@nagarnigamaligarh.in', '+91 94120 11001', 'mechanic', 'zone-2'),
('usr-mech-2', 'Santosh Sharma (Engine)', 'santosh.mechanic@nagarnigamaligarh.in', '+91 94120 11002', 'mechanic', 'zone-2'),
('usr-mech-3', 'Irfan Khan (Auto Elec)', 'irfan.mechanic@nagarnigamaligarh.in', '+91 94120 11003', 'mechanic', 'zone-2'),
('usr-driver-1', 'Rameshwar Dayal', 'rameshwar.driver@nagarnigamaligarh.in', '+91 94120 22001', 'driver', 'zone-1'),
('usr-driver-2', 'Bhole Shankar', 'bhole.driver@nagarnigamaligarh.in', '+91 94120 22002', 'driver', 'zone-2'),
('usr-driver-3', 'Mohammad Aslam', 'aslam.driver@nagarnigamaligarh.in', '+91 94120 22003', 'driver', 'zone-3'),
('usr-driver-4', 'Satish Chandra', 'satish.driver@nagarnigamaligarh.in', '+91 94120 22004', 'driver', 'zone-4')
ON CONFLICT (id) DO NOTHING;

-- 4. WORKSHOPS
INSERT INTO workshops (id, name, location, capacity, manager_id) VALUES
('ws-central', 'Central Municipal Workshop & Depot', 'Bannadevi Industrial Area, GT Road Aligarh', 25, 'usr-workshop'),
('ws-zone1', 'Civil Lines Sub-Depot Workshop', 'Near Exhibition Ground, Aligarh', 10, 'usr-workshop'),
('ws-zone3', 'Old City Maintenance Bay', 'Sasni Gate Nagar Nigam Yard, Aligarh', 8, 'usr-workshop')
ON CONFLICT (id) DO NOTHING;

-- 5. VEHICLE MASTER
INSERT INTO vehicles (id, registration_number, vehicle_type, category, make, model, manufacturing_year, fuel_type, engine_number, chassis_number, capacity, ownership_type, status, assigned_zone_id, assigned_ward_id, assigned_driver_id, purchase_date, insurance_expiry, fitness_expiry, puc_expiry, permit_expiry, current_odometer_km) VALUES
('veh-1', 'UP81 BT 1024', 'Refuse Compactor (14 CBM)', 'Heavy Sanitation', 'Tata Motors', 'Signa 1918.K', 2022, 'Diesel', '497TC92-0199', 'MAT412019N1A90812', '14 Cu.m', 'Municipal Owned', 'Under Repair', 'zone-1', 'ward-1', 'usr-driver-1', '2022-04-10', '2027-04-09', '2026-11-20', '2026-10-15', '2028-04-09', 42800),
('veh-2', 'UP81 BT 1025', 'Refuse Compactor (14 CBM)', 'Heavy Sanitation', 'Tata Motors', 'Signa 1918.K', 2022, 'Diesel', '497TC92-0200', 'MAT412019N1A90813', '14 Cu.m', 'Municipal Owned', 'Deployed', 'zone-1', 'ward-2', 'usr-driver-2', '2022-04-10', '2027-04-09', '2027-03-12', '2026-12-05', '2028-04-09', 39400),
('veh-3', 'UP81 AT 4521', 'Dumper Placer (Twin Bin)', 'Medium Sanitation', 'Ashok Leyland', 'Ecomet 1215 HE', 2021, 'Diesel', 'H6ETI4-8821', 'MB1EFAEB4MA128911', '6 Ton', 'Municipal Owned', 'Breakdown', 'zone-2', 'ward-4', 'usr-driver-3', '2021-08-15', '2027-08-14', '2026-09-30', '2026-10-01', '2027-08-14', 51200),
('veh-4', 'UP81 AT 4522', 'Dumper Placer (Twin Bin)', 'Medium Sanitation', 'Ashok Leyland', 'Ecomet 1215 HE', 2021, 'Diesel', 'H6ETI4-8822', 'MB1EFAEB4MA128912', '6 Ton', 'Municipal Owned', 'Available', 'zone-2', 'ward-5', NULL, '2021-08-15', '2027-08-14', '2027-01-10', '2026-11-18', '2027-08-14', 47800),
('veh-5', 'UP81 CZ 8890', 'JCB Backhoe Loader', 'Special Equipment', 'JCB India', '3DX Super', 2023, 'Diesel', '448TA4-3112', 'HAR3DXS02PC981240', '1.1 Cu.m', 'Municipal Owned', 'Under Repair', 'zone-3', 'ward-6', NULL, '2023-02-20', '2028-02-19', '2027-05-14', '2026-12-25', '2028-02-19', 18600),
('veh-6', 'UP81 DT 3311', 'Sewer Suction & Jetting Machine', 'Special Equipment', 'Tata Motors', 'LPT 1613 Cowl', 2020, 'Diesel', '697TC56-4421', 'MAT416021L1A54321', '6000 Litres', 'Municipal Owned', 'Awaiting Spare Parts', 'zone-3', 'ward-7', 'usr-driver-4', '2020-11-05', '2026-11-04', '2026-10-10', '2026-09-28', '2026-11-04', 68400),
('veh-7', 'UP81 DT 5521', 'Mechanical Road Sweeper', 'Special Equipment', 'TPS Motors', 'RoadMaster 600', 2022, 'Diesel', '4BT39-9182', 'TPS600N82190182', '6 CBM', 'Municipal Owned', 'Deployed', 'zone-1', 'ward-3', NULL, '2022-09-15', '2027-09-14', '2027-04-18', '2026-11-02', '2027-09-14', 29100),
('veh-8', 'UP81 ET 7712', 'Garbage Tipper (Tata Ace)', 'Light Sanitation', 'Tata Motors', 'Ace Gold CNG', 2023, 'CNG', '275CNG-1102', 'MAT275CNG4PA88124', '1.8 CBM', 'Municipal Owned', 'Running', 'zone-4', 'ward-8', NULL, '2023-06-11', '2028-06-10', '2027-08-20', '2027-01-14', '2028-06-10', 14200),
('veh-9', 'UP81 ET 7713', 'Garbage Tipper (Tata Ace)', 'Light Sanitation', 'Tata Motors', 'Ace Gold CNG', 2023, 'CNG', '275CNG-1103', 'MAT275CNG4PA88125', '1.8 CBM', 'Municipal Owned', 'Ready for Deployment', 'zone-4', 'ward-9', NULL, '2023-06-11', '2028-06-10', '2027-08-20', '2027-01-14', '2028-06-10', 13900),
('veh-10', 'UP81 FT 9940', 'Water Tanker (9000L)', 'Special Equipment', 'Ashok Leyland', 'Partner 1616', 2021, 'Diesel', 'H4CTI-9921', 'MB1PART4M8192019', '9000 Litres', 'Municipal Owned', 'Available', 'zone-2', 'ward-5', NULL, '2021-03-10', '2027-03-09', '2027-02-15', '2026-12-10', '2027-03-09', 34500)
ON CONFLICT (id) DO NOTHING;

-- 6. SPARE PARTS & INVENTORY
INSERT INTO parts (id, part_name, part_number, category, compatible_vehicle_types, unit, opening_stock, current_stock, min_stock, supplier, purchase_price) VALUES
('prt-1', 'Hydraulic Main Cylinder Seal Kit (14 CBM)', 'HYD-SK-14C', 'Hydraulics', 'Refuse Compactor (14 CBM)', 'Sets', 12, 2, 5, 'Wipro Hydraulics Ltd.', 4850),
('prt-2', 'Heavy Duty Brake Shoe Lining Set', 'BRK-SH-1918', 'Brakes', 'Refuse Compactor, Dumper Placer', 'Sets', 25, 14, 8, 'Rane Brakes India', 3200),
('prt-3', 'High Pressure Jetting Hose (60m 1")', 'SEW-HOS-60M', 'Special Equipment', 'Sewer Suction & Jetting Machine', 'Nos', 4, 1, 2, 'Parker Hannifin', 24500),
('prt-4', 'Diesel Fuel Injector Nozzle Assembly', 'ENG-NOZ-CRDI', 'Engine', 'Tata Motors Signa, Ecomet', 'Sets', 18, 6, 6, 'Bosch India Ltd.', 8900),
('prt-5', 'JCB Heavy Duty Hydraulic Pump 3DX', 'JCB-HP-3DX', 'Hydraulics', 'JCB Backhoe Loader', 'Nos', 5, 1, 3, 'JCB Genuine Spares', 36000),
('prt-6', 'Engine Oil 15W40 CI-4 Plus (210L Drum)', 'OIL-15W40-D', 'Consumables', 'All Heavy & Medium Vehicles', 'Litres', 630, 180, 200, 'Indian Oil Servo', 185),
('prt-7', 'Alternator 24V 55A Heavy Duty', 'ELEC-ALT-24V', 'Electrical', 'Tata Signa, Ashok Leyland', 'Nos', 10, 4, 4, 'Lucas TVS', 7600),
('prt-8', 'Clutch Plate & Pressure Assembly 352mm', 'CLT-SET-352', 'Transmission', 'Tata 1918, Ecomet 1215', 'Sets', 8, 3, 3, 'Valeo Clutch India', 11400)
ON CONFLICT (id) DO NOTHING;

-- 7. BREAKDOWNS
INSERT INTO breakdowns (id, breakdown_number, vehicle_id, driver_id, reported_by, location, ward_id, breakdown_date, problem_category, problem_description, severity, vehicle_condition, status, acknowledged_by, acknowledged_at, collected_at, workshop_received_at) VALUES
('bk-101', 'BD-2026-0089', 'veh-1', 'usr-driver-1', 'Rameshwar Dayal (Driver)', 'Medical Road, Near AMU Circle', 'ward-1', NOW() - INTERVAL '36 hours', 'Hydraulic System', 'Compactor blade stuck midway. High hydraulic oil leakage from rear cylinder seal.', 'Critical', 'Immobile - Stopped at curbside', 'Repair', 'usr-fleet', NOW() - INTERVAL '35 hours 45 minutes', NOW() - INTERVAL '34 hours', NOW() - INTERVAL '33 hours'),
('bk-102', 'BD-2026-0090', 'veh-3', 'usr-driver-3', 'Mohammad Aslam (Driver)', 'Bannadevi Chauraha, GT Road', 'ward-4', NOW() - INTERVAL '14 hours', 'Brakes', 'Air brake pressure dropping continuously, pedal spongy and loss of braking power.', 'Critical', 'Parked at roadside safely', 'Workshop Received', 'usr-fleet', NOW() - INTERVAL '13 hours 30 minutes', NOW() - INTERVAL '11 hours', NOW() - INTERVAL '10 hours'),
('bk-103', 'BD-2026-0091', 'veh-6', 'usr-driver-4', 'Satish Chandra (Driver)', 'Achal Tal Waterworks Road', 'ward-7', NOW() - INTERVAL '72 hours', 'Special Equipment', 'High pressure suction pump rotor jammed during desilting operation. Pressure relief valve damaged.', 'High', 'Towed to central workshop', 'Diagnosis', 'usr-fleet', NOW() - INTERVAL '71 hours', NOW() - INTERVAL '70 hours', NOW() - INTERVAL '68 hours'),
('bk-104', 'BD-2026-0092', 'veh-5', NULL, 'Manoj Gupta (SI Ward 6)', 'Sasni Gate Drain Clearance Site', 'ward-6', NOW() - INTERVAL '48 hours', 'Hydraulics', 'Front loader arm hydraulic pressure failure, erratic jerking when lifting heavy soil.', 'High', 'Operational but unsafe for field work', 'Repair', 'usr-fleet', NOW() - INTERVAL '47 hours', NOW() - INTERVAL '45 hours', NOW() - INTERVAL '44 hours')
ON CONFLICT (id) DO NOTHING;

-- 8. JOB CARDS
INSERT INTO job_cards (id, job_card_number, breakdown_id, vehicle_id, workshop_id, complaint, diagnosis, required_repair, assigned_mechanic_id, estimated_cost, actual_cost, work_started_at, work_completed_at, inspection_status, status, remarks) VALUES
('jc-201', 'JC-2026-0142', 'bk-101', 'veh-1', 'ws-central', 'Compactor blade stuck, hydraulic oil leak', 'Rear cylinder seal blown due to metal debris. Piston shaft minor scoring.', 'Replace cylinder seal kit, polish hydraulic ram, flush hydraulic oil', 'usr-mech-1', 9500, 4850, NOW() - INTERVAL '30 hours', NULL, 'Pending', 'Repair', 'Seal kit requisitioned. Assembly in progress by Kallu Mistri.'),
('jc-202', 'JC-2026-0143', 'bk-102', 'veh-3', 'ws-central', 'Air brake leakage, pedal loss', 'Dual brake valve internal diaphragm torn, rear left wheel cylinder leaking', 'Replace brake shoe set and overhaul brake valve', 'usr-mech-2', 6800, 0, NOW() - INTERVAL '8 hours', NULL, 'Pending', 'Diagnosis', 'Vehicle placed in inspection bay 2.'),
('jc-203', 'JC-2026-0144', 'bk-103', 'veh-6', 'ws-central', 'Suction pump rotor jammed', 'Severe cavitation in suction impeller, high pressure jetting hose burst', 'Jetting hose replacement and impeller realignment', 'usr-mech-1', 32000, 0, NOW() - INTERVAL '60 hours', NULL, 'Pending', 'Diagnosis', 'Awaiting clearance on purchase of high-pressure jetting hose.'),
('jc-204', 'JC-2026-0145', 'bk-104', 'veh-5', 'ws-central', 'Front loader hydraulic failure', 'Hydraulic pump valve spool stuck, pump pressure low (120 bar vs 210 bar spec)', 'Overhaul hydraulic pump, clean spool valves', 'usr-mech-1', 12000, 0, NOW() - INTERVAL '40 hours', NULL, 'Pending', 'Repair', 'Hydraulic pressure test scheduled post valve fitment.')
ON CONFLICT (id) DO NOTHING;

-- 9. PARTS ISSUED TO JOB CARDS
INSERT INTO job_card_parts (id, job_card_id, part_id, quantity, unit_price, issued_by) VALUES
('jcp-1', 'jc-201', 'prt-1', 1, 4850, 'usr-workshop')
ON CONFLICT (id) DO NOTHING;

-- 10. FIELD REDEPLOYMENTS (STANDBY VEHICLES)
INSERT INTO redeployments (id, original_vehicle_id, replacement_vehicle_id, ward_id, zone_id, deployment_location, assigned_driver_id, reason, deployment_date, status, approved_by) VALUES
('rd-301', 'veh-1', 'veh-4', 'ward-1', 'zone-1', 'Medical Road & Dodhpur Sanitation Beat', 'usr-driver-1', 'Vehicle UP81 BT 1024 undergoing emergency hydraulic cylinder repair. Replacement deployed to prevent waste accumulation.', NOW() - INTERVAL '32 hours', 'Active', 'usr-fleet')
ON CONFLICT (id) DO NOTHING;

-- 11. MAINTENANCE SCHEDULES
INSERT INTO maintenance_schedules (id, vehicle_id, maintenance_type, title, description, interval_km, interval_days, last_service_date, next_due_date, status) VALUES
('ms-1', 'veh-2', 'Preventive', '40,000 KM Major Service', 'Engine oil change, oil filter, fuel filter, hydraulic tank suction strainer check', 10000, 90, '2026-06-15', '2026-09-18', 'Scheduled'),
('ms-2', 'veh-4', 'Preventive', '50,000 KM Full Brake & Wheel Bearing Overhaul', 'Grease packing of wheel hubs, brake lining check, air dryer filter replacement', 15000, 120, '2026-05-10', '2026-09-12', 'Overdue'),
('ms-3', 'veh-7', 'Preventive', 'Sweeping Broom & Vacuum Impeller Inspection', 'Main broom replacement, suction nozzle rubber skirt adjustment', 5000, 45, '2026-08-01', '2026-09-25', 'Scheduled'),
('ms-4', 'veh-8', 'Preventive', '15,000 KM CNG Kit & Spark Plug Service', 'CNG filter replacement, leak test, throttle body cleaning', 7500, 60, '2026-07-20', '2026-09-22', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- 12. AUDIT LOGS
INSERT INTO audit_logs (id, entity_name, entity_id, action, performed_by, performed_by_role, details, created_at) VALUES
('aud-1', 'breakdown', 'bk-101', 'REPORT_BREAKDOWN', 'Rameshwar Dayal', 'driver', '{"vehicle": "UP81 BT 1024", "problem": "Hydraulic oil leakage and blade stuck"}'::jsonb, NOW() - INTERVAL '36 hours'),
('aud-2', 'breakdown', 'bk-101', 'ACKNOWLEDGE', 'Mahesh Chandra Varshney', 'fleet_manager', '{"acknowledged": true, "dispatch_recovery": true}'::jsonb, NOW() - INTERVAL '35 hours 45 minutes'),
('aud-3', 'job_card', 'jc-201', 'CREATE_JOB_CARD', 'Rakesh Babu Sharma', 'workshop_manager', '{"job_card": "JC-2026-0142", "assigned_to": "Kallu Mistri"}'::jsonb, NOW() - INTERVAL '30 hours'),
('aud-4', 'job_card_parts', 'jcp-1', 'ISSUE_SPARE_PART', 'Rakesh Babu Sharma', 'workshop_manager', '{"part": "Hydraulic Main Cylinder Seal Kit", "quantity": 1, "cost": 4850}'::jsonb, NOW() - INTERVAL '24 hours'),
('aud-5', 'redeployment', 'rd-301', 'DEPLOY_STANDBY', 'Mahesh Chandra Varshney', 'fleet_manager', '{"original": "UP81 BT 1024", "replacement": "UP81 AT 4522", "ward": 1}'::jsonb, NOW() - INTERVAL '32 hours');
