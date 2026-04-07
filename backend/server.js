require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importer les routes
const suppliersRoutes = require('./services/suppliers/routes');
const ordersRoutes = require('./services/orders/routes');
const reliabilityRoutes = require('./services/reliability/routes');
const statsRoutes = require('./services/stats/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reliability', reliabilityRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API Prédicteur de retard fournisseur',
        endpoints: [
            '/api/suppliers',
            '/api/suppliers/ranking',
            '/api/orders',
            '/api/reliability/recommendation/:id',
            '/api/stats/dashboard'
        ]
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   🚀 Serveur démarré avec succès      ║
    ╠═══════════════════════════════════════╣
    ║   📡 URL: http://localhost:${PORT}    ║
    ║   📊 API: /api                        ║
    ╚═══════════════════════════════════════╝
    `);
});