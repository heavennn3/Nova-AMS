-- Simplified ERD database for internship report only.
-- Creates separate MySQL database named `intern`.
-- Intentionally denormalized for clean report ERD.

DROP DATABASE IF EXISTS intern;
CREATE DATABASE intern CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intern;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE regions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE sites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    region_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    address TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_sites_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    site_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_departments_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    site_id BIGINT UNSIGNED NULL,
    department_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'User',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_users_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    supplier_type VARCHAR(100) NULL COMMENT 'supplier, vendor, manufacturer, oem',
    contact_person VARCHAR(150) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(100) NOT NULL UNIQUE,
    site_id BIGINT UNSIGNED NULL,
    region_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    added_by BIGINT UNSIGNED NULL,
    asset_name VARCHAR(200) NULL,
    category VARCHAR(150) NULL,
    type VARCHAR(150) NULL,
    status VARCHAR(100) NULL,
    oem VARCHAR(150) NULL,
    location VARCHAR(200) NULL,
    quantity INT NOT NULL DEFAULT 1,
    purchase_year YEAR NULL,
    serial_number VARCHAR(150) NULL,
    part_number VARCHAR(150) NULL,
    condition_status VARCHAR(100) NULL,
    image_path VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_assets_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_assets_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    CONSTRAINT fk_assets_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT fk_assets_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE spare_parts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    site_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    part_name VARCHAR(200) NOT NULL,
    part_number VARCHAR(150) NULL,
    category VARCHAR(150) NULL,
    description TEXT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    status VARCHAR(100) NULL,
    location VARCHAR(200) NULL,
    unit_cost DECIMAL(12,2) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_spare_parts_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_spare_parts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE licenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    site_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    license_name VARCHAR(200) NOT NULL,
    license_key VARCHAR(255) NULL,
    software_name VARCHAR(200) NULL,
    license_type VARCHAR(100) NULL,
    total_seats INT NULL,
    used_seats INT NULL,
    expiry_date DATE NULL,
    status VARCHAR(100) NULL,
    cost DECIMAL(12,2) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_licenses_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_licenses_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE asset_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(100) NULL UNIQUE,
    asset_id BIGINT UNSIGNED NULL,
    requested_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    request_type VARCHAR(100) NULL COMMENT 'asset request, loan, return, replacement',
    purpose TEXT NULL,
    loan_date DATE NULL,
    expected_return_date DATE NULL,
    actual_return_date DATE NULL,
    condition_status VARCHAR(100) NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'pending',
    remarks TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_asset_requests_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_requests_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_requests_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE asset_transfers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id VARCHAR(100) NULL UNIQUE,
    asset_id BIGINT UNSIGNED NULL,
    from_site_id BIGINT UNSIGNED NULL,
    to_site_id BIGINT UNSIGNED NULL,
    requested_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    transfer_date DATE NULL,
    reason TEXT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_asset_transfers_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_transfers_from_site FOREIGN KEY (from_site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_transfers_to_site FOREIGN KEY (to_site_id) REFERENCES sites(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_transfers_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_transfers_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uploaded_by BIGINT UNSIGNED NULL,
    documentable_type VARCHAR(100) NULL COMMENT 'asset, request, license, spare_part',
    documentable_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NULL,
    file_path VARCHAR(255) NULL,
    file_type VARCHAR(100) NULL,
    uploaded_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE audits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    auditable_type VARCHAR(100) NULL COMMENT 'asset, request, user, license, spare_part',
    auditable_id BIGINT UNSIGNED NULL,
    event VARCHAR(100) NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    url VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_audits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE custom_fields (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL COMMENT 'asset, user, spare_part, license, request',
    field_name VARCHAR(150) NOT NULL,
    field_label VARCHAR(150) NULL,
    field_type VARCHAR(100) NULL,
    field_value TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
