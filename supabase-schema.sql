-- Cue CRM Database Schema for Supabase
-- Run this entire script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT '',
  contact_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  facebook_page TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT 'MO',
  industry TEXT DEFAULT '',
  current_website_quality TEXT DEFAULT '',
  has_website TEXT DEFAULT '',
  has_facebook_page TEXT DEFAULT '',
  google_business_profile TEXT DEFAULT '',
  service_opportunity TEXT DEFAULT '',
  suggested_offer TEXT DEFAULT '',
  estimated_deal_value DOUBLE PRECISION,
  lead_source TEXT DEFAULT '',
  lead_status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Warm',
  last_contacted_date TEXT DEFAULT '',
  next_follow_up_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  pain_points TEXT DEFAULT '',
  personalized_pitch TEXT DEFAULT '',
  demo_website_url TEXT DEFAULT '',
  crm_demo_url TEXT DEFAULT '',
  marketing_package_interest TEXT DEFAULT '',
  website_package_interest TEXT DEFAULT '',
  crm_package_interest TEXT DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  place_id TEXT DEFAULT '',
  route_eligible INTEGER NOT NULL DEFAULT 1,
  last_visited_date TEXT DEFAULT '',
  next_visit_date TEXT DEFAULT '',
  in_person_visit_status TEXT DEFAULT 'Not visited',
  visit_notes TEXT DEFAULT '',
  do_not_visit INTEGER NOT NULL DEFAULT 0,
  preferred_visit_time TEXT DEFAULT '',
  business_hours TEXT DEFAULT '',
  route_score DOUBLE PRECISION,
  route_notes TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'note',
  description TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  due_date TEXT DEFAULT '',
  task_type TEXT DEFAULT 'Follow up',
  priority TEXT DEFAULT 'Normal',
  status TEXT DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  business_name TEXT DEFAULT '',
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  service_sold TEXT DEFAULT '',
  package_type TEXT DEFAULT '',
  monthly_value DOUBLE PRECISION,
  one_time_setup_value DOUBLE PRECISION,
  estimated_close_date TEXT DEFAULT '',
  deal_stage TEXT DEFAULT 'Opportunity',
  proposal_url TEXT DEFAULT '',
  contract_status TEXT DEFAULT 'None',
  payment_status TEXT DEFAULT 'Unpaid',
  notes TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS demos (
  id SERIAL PRIMARY KEY,
  business_name TEXT DEFAULT '',
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  demo_url TEXT DEFAULT '',
  original_website_url TEXT DEFAULT '',
  demo_status TEXT DEFAULT 'Idea',
  layout_option_used TEXT DEFAULT '',
  date_started TEXT DEFAULT '',
  date_completed TEXT DEFAULT '',
  date_sent TEXT DEFAULT '',
  client_feedback TEXT DEFAULT '',
  needed_changes TEXT DEFAULT '',
  follow_up_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'cold_call',
  content TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  package_name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  setup_price DOUBLE PRECISION,
  monthly_price DOUBLE PRECISION,
  included_features TEXT NOT NULL DEFAULT '[]',
  best_for TEXT DEFAULT '',
  internal_notes TEXT DEFAULT '',
  created_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_date TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS route_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  route_date TEXT DEFAULT '',
  start_address TEXT DEFAULT '',
  end_address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT 'MO',
  radius_miles DOUBLE PRECISION,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  status TEXT DEFAULT 'Draft',
  total_stops INTEGER DEFAULT 0,
  estimated_drive_time TEXT DEFAULT '',
  estimated_route_distance TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  apple_maps_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  ai_summary TEXT DEFAULT '',
  route_goal TEXT DEFAULT '',
  created_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_plan_id INTEGER NOT NULL REFERENCES route_plans(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  business_name TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  facebook_page TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  stop_order INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'Warm',
  lead_status TEXT DEFAULT 'New',
  industry TEXT DEFAULT '',
  service_opportunity TEXT DEFAULT '',
  suggested_offer TEXT DEFAULT '',
  estimated_deal_value DOUBLE PRECISION,
  visit_reason TEXT DEFAULT '',
  talking_points TEXT NOT NULL DEFAULT '[]',
  recommended_pitch TEXT DEFAULT '',
  leave_behind_suggestion TEXT DEFAULT '',
  follow_up_action TEXT DEFAULT '',
  estimated_visit_minutes INTEGER DEFAULT 15,
  arrival_window TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  visit_outcome TEXT DEFAULT '',
  spoke_to TEXT DEFAULT '',
  interest_level TEXT DEFAULT '',
  follow_up_date TEXT DEFAULT '',
  next_action TEXT DEFAULT '',
  visit_completed INTEGER DEFAULT 0,
  visit_completed_at TEXT DEFAULT '',
  skipped INTEGER DEFAULT 0,
  skip_reason TEXT DEFAULT '',
  route_score DOUBLE PRECISION,
  created_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_at TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('businessName', 'Cue Marketing Solutions'),
  ('ownerName', 'Aaron'),
  ('email', ''),
  ('phone', '918-808-0074'),
  ('defaultCity', 'Joplin'),
  ('defaultState', 'MO'),
  ('defaultRadius', '25'),
  ('website', ''),
  ('address', ''),
  ('tagline', 'Digital Marketing for Local Businesses'),
  ('timezone', 'America/Chicago'),
  ('currency', 'USD'),
  ('dateFormat', 'MM/DD/YYYY'),
  ('leadDefaultStatus', 'New'),
  ('leadDefaultPriority', 'Warm'),
  ('followUpDefaultDays', '3'),
  ('enableEmailNotifications', 'false'),
  ('enableSmsNotifications', 'false')
ON CONFLICT (key) DO NOTHING;
