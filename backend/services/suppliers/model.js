const db = require('../database/mysql');

// Tous les fournisseurs
const getAll = async () => {
    return await db.query(`
        SELECT id, code, name, created_at 
        FROM suppliers 
        ORDER BY name
    `);
};

// Fournisseur par ID
const getById = async (id) => {
    const rows = await db.query(`
        SELECT * FROM suppliers WHERE id = ?
    `, [id]);
    return rows[0];
};

// Fournisseur par code
const getByCode = async (code) => {
    const rows = await db.query(`
        SELECT * FROM suppliers WHERE code = ?
    `, [code]);
    return rows[0];
};

// Créer fournisseur
const create = async (code, name) => {
    const result = await db.query(`
        INSERT INTO suppliers (code, name) VALUES (?, ?)
    `, [code, name]);
    return result.insertId;
};

// Mettre à jour
const update = async (id, name) => {
    await db.query(`
        UPDATE suppliers SET name = ? WHERE id = ?
    `, [name, id]);
    return true;
};

// Supprimer
const remove = async (id) => {
    await db.query(`
        DELETE FROM suppliers WHERE id = ?
    `, [id]);
    return true;
};

// Classement avec score
const getRanking = async () => {
    return await db.query(`
        SELECT 
            s.id,
            s.code,
            s.name,
            COALESCE(sr.reliability_score, 0) as score,
            COALESCE(sr.total_orders, 0) as total_commandes,
            COALESCE(sr.on_time_orders, 0) as commandes_heure,
            COALESCE(sr.late_orders, 0) as commandes_retard,
            COALESCE(sr.avg_delay_days, 0) as retard_moyen_jours
        FROM suppliers s
        LEFT JOIN supplier_reliability sr ON s.id = sr.supplier_id
        ORDER BY score DESC
    `);
};

module.exports = {
    getAll,
    getById,
    getByCode,
    create,
    update,
    remove,
    getRanking
};