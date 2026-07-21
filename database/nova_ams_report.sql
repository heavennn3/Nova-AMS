DROP DATABASE IF EXISTS nova_ams_report;
CREATE DATABASE nova_ams_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nova_ams_report;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE regions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_regions_code (code),
    KEY idx_regions_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sites (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    region_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    address VARCHAR(500) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_sites_code (code),
    KEY idx_sites_region_id (region_id),
    KEY idx_sites_name (name),
    CONSTRAINT fk_sites_region_id
        FOREIGN KEY (region_id) REFERENCES regions (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    site_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Employee',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_site_id (site_id),
    KEY idx_users_role (role),
    KEY idx_users_status (status),
    CONSTRAINT fk_users_site_id
        FOREIGN KEY (site_id) REFERENCES sites (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suppliers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    supplier_type VARCHAR(100) NOT NULL COMMENT 'OEM, Vendor, Manufacturer, Supplier',
    PRIMARY KEY (id),
    KEY idx_suppliers_name (name),
    KEY idx_suppliers_type (supplier_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    asset_id VARCHAR(100) NOT NULL,
    site_id BIGINT UNSIGNED NULL,
    region_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    added_by BIGINT UNSIGNED NULL,
    asset_name VARCHAR(200) NOT NULL,
    category VARCHAR(150) NULL,
    type VARCHAR(150) NULL,
    status VARCHAR(100) NULL,
    oem VARCHAR(150) NULL,
    location VARCHAR(200) NULL,
    purchase_year YEAR NULL,
    serial_number VARCHAR(150) NULL,
    part_number VARCHAR(150) NULL,
    loan_date DATE NULL,
    expected_return_date DATE NULL,
    actual_return_date DATE NULL,
    purpose VARCHAR(500) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_assets_asset_id (asset_id),
    KEY idx_assets_site_id (site_id),
    KEY idx_assets_region_id (region_id),
    KEY idx_assets_supplier_id (supplier_id),
    KEY idx_assets_added_by (added_by),



    KEY idx_assets_category (category),
    KEY idx_assets_type (type),
    KEY idx_assets_status (status),

    KEY idx_assets_serial_number (serial_number),
    CONSTRAINT fk_assets_site_id
        FOREIGN KEY (site_id) REFERENCES sites (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_region_id
        FOREIGN KEY (region_id) REFERENCES regions (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_supplier_id
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_assets_added_by
        FOREIGN KEY (added_by) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL


) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE spare_parts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    site_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    part_name VARCHAR(200) NOT NULL,
    part_number VARCHAR(150) NULL,
    category VARCHAR(150) NULL,
    description VARCHAR(500) NULL,
    status VARCHAR(100) NULL,
    location VARCHAR(200) NULL,
    PRIMARY KEY (id),
    KEY idx_spare_parts_site_id (site_id),
    KEY idx_spare_parts_supplier_id (supplier_id),
    KEY idx_spare_parts_part_number (part_number),
    KEY idx_spare_parts_category (category),
    KEY idx_spare_parts_status (status),
    CONSTRAINT fk_spare_parts_site_id
        FOREIGN KEY (site_id) REFERENCES sites (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_spare_parts_supplier_id
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE licenses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    site_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NULL,
    license_name VARCHAR(200) NOT NULL,
    license_key VARCHAR(255) NULL,
    license_type VARCHAR(100) NULL,
    total_seats INT UNSIGNED NOT NULL DEFAULT 1,
    used_seats INT UNSIGNED NOT NULL DEFAULT 0,
    expiry_date DATE NULL,
    status VARCHAR(100) NULL,
    PRIMARY KEY (id),
    KEY idx_licenses_site_id (site_id),
    KEY idx_licenses_supplier_id (supplier_id),
    KEY idx_licenses_name (license_name),
    KEY idx_licenses_type (license_type),
    KEY idx_licenses_status (status),
    KEY idx_licenses_expiry_date (expiry_date),
    CONSTRAINT fk_licenses_site_id
        FOREIGN KEY (site_id) REFERENCES sites (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_licenses_supplier_id
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE audits (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    asset_id BIGINT UNSIGNED NULL,
    event VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL,
    PRIMARY KEY (id),
    KEY idx_audits_user_id (user_id),
    KEY idx_audits_asset_id (asset_id),
    KEY idx_audits_event (event),

    CONSTRAINT fk_audits_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_audits_asset_id
        FOREIGN KEY (asset_id) REFERENCES assets (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
