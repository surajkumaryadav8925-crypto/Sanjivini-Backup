-- Healthcare Platform Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('patient', 'hospital_staff', 'government_admin', 'super_admin');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE risk_level AS ENUM ('red', 'yellow', 'green');
CREATE TYPE triage_status AS ENUM ('in_progress', 'completed', 'cancelled');
CREATE TYPE bed_type AS ENUM ('icu', 'general', 'private', 'emergency', 'pediatric', 'maternity');
CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE emergency_status AS ENUM ('reported', 'dispatched', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'synced', 'failed');
CREATE TYPE offline_operation_type AS ENUM ('create', 'update', 'delete');
CREATE TYPE hospital_verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE opd_queue_status AS ENUM ('waiting', 'called', 'in_progress', 'completed', 'skipped', 'no_show');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE hospital_type AS ENUM ('government', 'private', 'charitable', 'trust');
CREATE TYPE hospital_category AS ENUM ('medical_college', 'district_hospital', 'sub_district', 'community', 'primary_healthcare', 'nursing_home', 'clinic');
CREATE TYPE outbreak_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE outbreak_status AS ENUM ('investigating', 'contained', 'active', 'resolved');
