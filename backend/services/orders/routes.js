const express = require('express');
const orderModel = require('./model');
const router = express.Router();

// Liste toutes les commandes
router.get('/', async (req, res) => {
    try {
        const orders = await orderModel.getAll();
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Commandes d'un fournisseur
router.get('/supplier/:supplierId', async (req, res) => {
    try {
        const orders = await orderModel.getBySupplier(req.params.supplierId);
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Créer une commande
router.post('/', async (req, res) => {
    try {
        const { supplier_id, order_date, expected_delivery_days } = req.body;
        const id = await orderModel.create(supplier_id, order_date, expected_delivery_days);
        res.status(201).json({ success: true, data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enregistrer réception
router.put('/:id/receive', async (req, res) => {
    try {
        const { received_date } = req.body;
        const result = await orderModel.markAsReceived(req.params.id, received_date);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;