CREATE DATABASE vres_dbs;
USE vres_dbs;

-- Table: Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table: Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    vendor_gst VARCHAR(50),
    vendor_address TEXT,
    password VARCHAR(255) NOT NULL, -- Stored as a hash
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- Table: Projects
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) UNIQUE NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL,
    voucher_points DECIMAL(10, 2) NOT NULL,
    description VARCHAR(225) NOT NULL,
    voucher_valid_from DATE,
    voucher_valid_till DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: Department
CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT,
    maker_id INT, -- Assuming this is a User who created the department
    checker_id INT, -- Assuming this is a User who approved/checked the department
    project_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maker_id) REFERENCES Users(id),
    FOREIGN KEY (checker_id) REFERENCES Users(id),
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);

-- Table: Beneficiaries
CREATE TABLE beneficiaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) not null,
    department_id INT,
    project_id INT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Department(id),
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);
 
-- Table: Preselect_user (Likely a junction table for users pre-selected for a project)
CREATE TABLE project_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    UNIQUE (user_id, project_id) -- A user should be preselected for a project only once
);

-- Table: Vouchers
CREATE TABLE vouchers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    beneficiary_id INT, -- Nullable if voucher is issued before assignment
    string_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code TEXT, -- Assuming QR code data/path is stored here
    status VARCHAR(50) NOT NULL, -- e.g., 'Issued', 'Redeemed', 'Expired'
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    FOREIGN KEY (beneficiary_id) REFERENCES Beneficiaries(id)
);

-- Table: Redemptions
CREATE TABLE redemptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    vendor_id INT NOT NULL, -- Assuming this is a User with a "Vendor" role
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    geo_lat FLOAT not null,
    geo_lon FLOAT not null,
    device_fingerprint VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES Vouchers(id),
    FOREIGN KEY (vendor_id) REFERENCES Users(id)
);

-- Table: Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    channel VARCHAR(50) NOT NULL, -- e.g., 'email', 'sms', 'in-app'
    recipient VARCHAR(255) NOT NULL, -- e.g., user_id or email/phone
    template_key VARCHAR(100) NOT NULL,
    payload JSON, -- For flexible message content (using JSON type if supported)
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: Audit_logs
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actor_user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity VARCHAR(100) NOT NULL, -- e.g., 'Voucher', 'Project', 'User'
    entity_id INT,
    meta JSON, -- Additional details about the change (using JSON type if supported)
    ip VARCHAR(50), -- IP address of the actor
    ua TEXT, -- User agent string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES Users(id)
);

-- Insert Roles (5 only)
-- Insert Roles
INSERT INTO roles (name) VALUES 
('Admin'),
('Maker'),
('Checker'),
('Project Coordinator'),
('Vendor'),
('Issuer'),
('Observer');

INSERT INTO users (name, email, phone, vendor_gst, vendor_address, password, is_active, created_at, otp, otp_expiry_date) VALUES
('Thandava Krishna', 'thandavakrishna1302@outlook.com', '9912996872', NULL, NULL, 'pass1234', 1, '2025-10-07 12:02:38', NULL, NULL),
('Ayesha Farheen', 'mohammedayesha0207@gmail.com', '7569666909', NULL, NULL, 'pass1234', 1, '2025-10-07 13:23:37', NULL, NULL),
('Keerthi Sree', 'kogantikeerthi89@gmail.com', '6281462604', 'GST62814', 'Hyderabad', 'pass1234', 1, '2025-10-07 13:25:03', NULL, NULL),
('Akhila kandru', 'akhilakandru@gmail.com', '7396106584', NULL, NULL, 'pass1234', 1, '2025-10-07 13:25:46', NULL, NULL),
('Mahidhar', 'yarramahidhar24@gmail.com', '7095921465', NULL, NULL, 'pass1234', 1, '2025-10-07 12:02:38', NULL, NULL),
('Sai Varma', 'saivarma.manthena@infosharesystems.com', '7702214224', NULL, NULL, 'pass1234', 1, '2025-10-07 12:02:38', NULL, NULL);
