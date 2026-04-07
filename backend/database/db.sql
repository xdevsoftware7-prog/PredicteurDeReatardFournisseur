-- Création de la base de données
CREATE DATABASE IF NOT EXISTS supplier_monitor;
USE supplier_monitor;

-- Table des fournisseurs
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    received_date DATE,
    expected_delivery_days INT DEFAULT 7,
    status ENUM('pending', 'received', 'delayed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_supplier_dates (supplier_id, order_date, received_date)
);

-- Table pour les métriques de fiabilité
CREATE TABLE supplier_reliability (
    supplier_id INT PRIMARY KEY,
    total_orders INT DEFAULT 0,
    on_time_orders INT DEFAULT 0,
    late_orders INT DEFAULT 0,
    reliability_score DECIMAL(5,2) DEFAULT 0,
    avg_delay_days DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Vue pour le classement des fournisseurs (alternative à la table)
CREATE VIEW supplier_ranking_view AS
SELECT 
    s.id,
    s.code,
    s.name,
    COUNT(o.id) as total_orders,
    SUM(CASE WHEN o.status = 'received' THEN 1 ELSE 0 END) as on_time_orders,
    SUM(CASE WHEN o.status = 'delayed' THEN 1 ELSE 0 END) as late_orders,
    ROUND(COALESCE(SUM(CASE WHEN o.status = 'received' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(o.id), 0), 0), 2) as reliability_score,
    COALESCE(AVG(CASE WHEN o.status = 'delayed' THEN DATEDIFF(o.received_date, o.order_date) - o.expected_delivery_days ELSE 0 END), 0) as avg_delay_days
FROM suppliers s
LEFT JOIN orders o ON s.id = o.supplier_id
GROUP BY s.id, s.code, s.name;