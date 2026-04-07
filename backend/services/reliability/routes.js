const express = require('express');
const reliabilityModel = require('./model');
const router = express.Router();

// Score d'un fournisseur
router.get('/score/:supplierId', async (req, res) => {
    try {
        const score = await reliabilityModel.getSupplierScore(req.params.supplierId);
        res.json({ success: true, data: score });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Recommandation pour un fournisseur
router.get('/recommendation/:supplierId', async (req, res) => {
    try {
        const recommendation = await reliabilityModel.getRecommendation(req.params.supplierId);
        res.json({ success: true, data: recommendation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fournisseurs à risque
router.get('/risky', async (req, res) => {
    try {
        const seuil = req.query.seuil || 70;
        const risky = await reliabilityModel.getRiskySuppliers(seuil);
        res.json({ success: true, data: risky });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rafraîchir les scores
router.post('/refresh', async (req, res) => {
    try {
        const result = await reliabilityModel.refreshScores();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;