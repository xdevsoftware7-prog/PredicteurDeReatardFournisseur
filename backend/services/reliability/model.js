const db = require('../database/mysql');

// Score de fiabilité d'un fournisseur
const getSupplierScore = async (supplierId) => {
    const rows = await db.query(`
        SELECT 
            s.name,
            s.code,
            COALESCE(sr.reliability_score, 0) as score,
            COALESCE(sr.total_orders, 0) as total,
            COALESCE(sr.on_time_orders, 0) as on_time,
            COALESCE(sr.late_orders, 0) as late,
            COALESCE(sr.avg_delay_days, 0) as avg_delay
        FROM suppliers s
        LEFT JOIN supplier_reliability sr ON s.id = sr.supplier_id
        WHERE s.id = ?
    `, [supplierId]);
    return rows[0];
};

// Recommandation (commander plus tôt)
const getRecommendation = async (supplierId) => {
    const score = await getSupplierScore(supplierId);
    
    if (!score) {
        return {
            fournisseur: `ID ${supplierId}`,
            delai_normal: 7,
            delai_recommande: 7,
            raison: "Pas assez de données"
        };
    }
    
    let delaiRecommande = 7;
    let raison = "";
    
    if (score.score < 60) {
        delaiRecommande = 7 + Math.ceil(score.avg_delay) + 2;
        raison = `⚠️ Fournisseur peu fiable (${score.score}%). Anticiper de ${Math.ceil(score.avg_delay) + 2} jours.`;
    } else if (score.score < 80) {
        delaiRecommande = 7 + Math.ceil(score.avg_delay);
        raison = `⚠️ Fournisseur moyennement fiable (${score.score}%). Anticiper de ${Math.ceil(score.avg_delay)} jours.`;
    } else {
        raison = `✅ Fournisseur fiable (${score.score}%). Délai standard suffisant.`;
    }
    
    return {
        fournisseur: score.name,
        code: score.code,
        score_fiabilite: score.score,
        delai_normal: 7,
        delai_recommande: delaiRecommande,
        raison: raison,
        statistiques: {
            total_commandes: score.total,
            commandes_retard: score.late,
            retard_moyen: score.avg_delay
        }
    };
};

// Fournisseurs à risque (alerte)
const getRiskySuppliers = async (seuil = 70) => {
    return await db.query(`
        SELECT 
            s.id,
            s.name,
            s.code,
            sr.reliability_score as score,
            sr.late_orders as retards,
            sr.total_orders as total,
            sr.avg_delay_days as retard_moyen
        FROM suppliers s
        JOIN supplier_reliability sr ON s.id = sr.supplier_id
        WHERE sr.reliability_score < ?
        ORDER BY sr.reliability_score ASC
    `, [seuil]);
};

// Rafraîchir tous les scores
const refreshScores = async () => {
    await db.query(`CALL refresh_supplier_scores()`);
    return { message: "Scores mis à jour" };
};

module.exports = {
    getSupplierScore,
    getRecommendation,
    getRiskySuppliers,
    refreshScores
};