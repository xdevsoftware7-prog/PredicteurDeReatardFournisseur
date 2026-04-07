const express = require('express');
const statsModel = require('./model');
const router = express.Router();

// Dashboard principal
router.get('/dashboard', async (req, res) => {
    try {
        const [global, best, worst, trend, impact] = await Promise.all([
            statsModel.getGlobalStats(),
            statsModel.getBestSuppliers(),
            statsModel.getWorstSuppliers(),
            statsModel.getMonthlyTrend(),
            statsModel.getImpactAnalysis()
        ]);
        
        res.json({
            success: true,
            data: {
                global,
                meilleurs_fournisseurs: best,
                pires_fournisseurs: worst,
                tendance_mensuelle: trend,
                impact_avant_apres: impact
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Stats globales simples
router.get('/global', async (req, res) => {
    try {
        const stats = await statsModel.getGlobalStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analyse d'impact
router.get('/impact', async (req, res) => {
    try {
        const impact = await statsModel.getImpactAnalysis();
        res.json({ success: true, data: impact });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;