const express = require('express');
const supplierModel = require('./model');
const router = express.Router();

// Liste tous les fournisseurs
router.get('/', async (req, res) => {
    try {
        const suppliers = await supplierModel.getAll();
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Classement des fournisseurs
router.get('/ranking', async (req, res) => {
    try {
        const ranking = await supplierModel.getRanking();
        res.json({ success: true, data: ranking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Un fournisseur spécifique
router.get('/:id', async (req, res) => {
    try {
        const supplier = await supplierModel.getById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Créer un fournisseur
router.post('/', async (req, res) => {
    try {
        const { code, name } = req.body;
        if (!code || !name) {
            return res.status(400).json({ success: false, message: 'Code et nom requis' });
        }
        
        const id = await supplierModel.create(code, name);
        res.status(201).json({ success: true, data: { id, code, name } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mettre à jour un fournisseur
router.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        await supplierModel.update(req.params.id, name);
        res.json({ success: true, message: 'Fournisseur mis à jour' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Supprimer un fournisseur
router.delete('/:id', async (req, res) => {
    try {
        await supplierModel.remove(req.params.id);
        res.json({ success: true, message: 'Fournisseur supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;