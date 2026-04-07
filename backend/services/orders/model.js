const db = require('../database/mysql');

// Toutes les commandes
const getAll = async () => {
    return await db.query(`
        SELECT o.*, s.name as supplier_name, s.code as supplier_code
        FROM orders o
        JOIN suppliers s ON o.supplier_id = s.id
        ORDER BY o.order_date DESC
    `);
};

// Commandes par fournisseur
const getBySupplier = async (supplierId) => {
    return await db.query(`
        SELECT *,
            DATEDIFF(received_date, order_date) as delai_reel,
            CASE 
                WHEN received_date IS NOT NULL 
                THEN DATEDIFF(received_date, order_date) - expected_delivery_days
                ELSE 0
            END as jours_retard
        FROM orders 
        WHERE supplier_id = ?
        ORDER BY order_date DESC
    `, [supplierId]);
};

// Créer une commande
const create = async (supplier_id, order_date, expected_delivery_days = 7) => {
    const result = await db.query(`
        INSERT INTO orders (supplier_id, order_date, expected_delivery_days, status)
        VALUES (?, ?, ?, 'pending')
    `, [supplier_id, order_date, expected_delivery_days]);
    return result.insertId;
};

// Enregistrer la réception
const markAsReceived = async (id, received_date) => {
    // Récupérer la commande
    const [order] = await db.query(`
        SELECT order_date, expected_delivery_days FROM orders WHERE id = ?
    `, [id]);
    
    if (!order) throw new Error('Commande non trouvée');
    
    // Calculer si retard
    const expectedDate = new Date(order.order_date);
    expectedDate.setDate(expectedDate.getDate() + order.expected_delivery_days);
    const received = new Date(received_date);
    const status = received > expectedDate ? 'delayed' : 'received';
    
    // Mettre à jour
    await db.query(`
        UPDATE orders 
        SET received_date = ?, status = ?
        WHERE id = ?
    `, [received_date, status, id]);
    
    // Rafraîchir les scores
    await db.query(`CALL refresh_supplier_scores()`);
    
    return { status, retard: status === 'delayed' ? Math.ceil((received - expectedDate) / (1000 * 60 * 60 * 24)) : 0 };
};

// Statistiques des commandes
const getStats = async () => {
    const rows = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as a_l_heure,
            SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as en_retard,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as en_attente,
            ROUND(SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taux_retard
        FROM orders
    `);
    return rows[0];
};

module.exports = {
    getAll,
    getBySupplier,
    create,
    markAsReceived,
    getStats
};