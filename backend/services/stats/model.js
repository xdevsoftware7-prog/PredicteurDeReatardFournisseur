const db = require('../../database/mysql');

// Statistiques globales
const getGlobalStats = async () => {
    const stats = await db.query(`
        SELECT 
            COUNT(*) as total_commandes,
            SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as commandes_retard,
            ROUND(SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taux_retard,
            COUNT(DISTINCT supplier_id) as fournisseurs_actifs
        FROM orders
    `);
    return stats[0];
};

// Top 3 meilleurs fournisseurs
const getBestSuppliers = async () => {
    return await db.query(`
        SELECT 
            s.name,
            s.code,
            sr.reliability_score as score,
            sr.on_time_orders as commandes_heure
        FROM suppliers s
        JOIN supplier_reliability sr ON s.id = sr.supplier_id
        WHERE sr.total_orders > 0
        ORDER BY sr.reliability_score DESC
        LIMIT 3
    `);
};

// Top 3 pires fournisseurs
const getWorstSuppliers = async () => {
    return await db.query(`
        SELECT 
            s.name,
            s.code,
            sr.reliability_score as score,
            sr.late_orders as commandes_retard,
            sr.avg_delay_days as retard_moyen
        FROM suppliers s
        JOIN supplier_reliability sr ON s.id = sr.supplier_id
        WHERE sr.total_orders > 0
        ORDER BY sr.reliability_score ASC
        LIMIT 3
    `);
};

// Évolution mensuelle
const getMonthlyTrend = async () => {
    return await db.query(`
        SELECT 
            DATE_FORMAT(order_date, '%Y-%m') as mois,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as retards,
            ROUND(SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taux_retard
        FROM orders
        WHERE order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(order_date, '%Y-%m')
        ORDER BY mois DESC
    `);
};

// Impact avant/après
const getImpactAnalysis = async () => {
    // Simuler l'impact (basé sur les données réelles)
    const stats = await getGlobalStats();
    const tauxActuel = parseFloat(stats.taux_retard);
    
    // Calculer l'impact si on applique les recommandations
    const [risky] = await db.query(`
        SELECT AVG(avg_delay_days) as avg_delay
        FROM supplier_reliability
        WHERE reliability_score < 70
    `);
    
    const reduction = risky.avg_delay ? Math.min(30, risky.avg_delay * 2) : 15;
    const tauxApres = Math.max(5, tauxActuel - reduction);
    
    return {
        avant: {
            taux_retard: tauxActuel,
            clients_mécontents: Math.round(stats.total_commandes * (tauxActuel / 100))
        },
        apres: {
            taux_retard: Math.round(tauxApres * 100) / 100,
            clients_mécontents: Math.round(stats.total_commandes * (tauxApres / 100)),
            amelioration: Math.round((tauxActuel - tauxApres) * 100) / 100
        },
        recommandation: "Anticipez les commandes chez les fournisseurs peu fiables"
    };
};

module.exports = {
    getGlobalStats,
    getBestSuppliers,
    getWorstSuppliers,
    getMonthlyTrend,
    getImpactAnalysis
};