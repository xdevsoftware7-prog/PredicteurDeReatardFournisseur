require('dotenv').config();
const db = require('./database/mysql');

async function seedDatabase() {
    console.log('🌱 Génération des données...\n');
    
    // 1. Créer les fournisseurs
    const suppliers = [
        ['SUP-A', 'Fournisseur Alpha'],
        ['SUP-B', 'Fournisseur Beta'],
        ['SUP-C', 'Fournisseur Gamma'],
        ['SUP-D', 'Fournisseur Delta'],
        ['SUP-E', 'Fournisseur Epsilon'],
        ['SUP-F', 'Fournisseur Zeta'],
        ['SUP-G', 'Fournisseur Eta'],
        ['SUP-H', 'Fournisseur Theta'],
        ['SUP-I', 'Fournisseur Iota'],
        ['SUP-J', 'Fournisseur Kappa']
    ];
    
    for (const [code, name] of suppliers) {
        await db.query('INSERT INTO suppliers (code, name) VALUES (?, ?)', [code, name]);
    }
    console.log('✅ 10 fournisseurs créés');
    
    // 2. Fiabilité par fournisseur (0-1)
    const reliability = {
        1: 0.92, 2: 0.45, 3: 0.78, 4: 0.88, 5: 0.65,
        6: 0.95, 7: 0.55, 8: 0.82, 9: 0.71, 10: 0.60
    };
    
    // 3. Générer 100 commandes
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    for (let i = 0; i < 100; i++) {
        const supplierId = Math.floor(Math.random() * 10) + 1;
        const isLate = Math.random() > reliability[supplierId];
        
        // Date commande
        const orderDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Délai normal 5-9 jours
        const normalDelay = Math.floor(Math.random() * 5) + 5;
        
        // Délai réel
        let actualDelay = normalDelay;
        if (isLate) actualDelay += Math.floor(Math.random() * 13) + 3;
        
        const receivedDate = new Date(orderDate);
        receivedDate.setDate(receivedDate.getDate() + actualDelay);
        
        await db.query(`
            INSERT INTO orders (supplier_id, order_date, received_date, expected_delivery_days, status)
            VALUES (?, ?, ?, ?, ?)
        `, [supplierId, orderDate, receivedDate, normalDelay, isLate ? 'delayed' : 'received']);
    }
    console.log('✅ 100 commandes générées');
    
    // 4. Calculer les scores
    await db.query(`
        INSERT INTO supplier_reliability (supplier_id, total_orders, on_time_orders, late_orders, reliability_score, avg_delay_days)
        SELECT 
            s.id,
            COUNT(o.id),
            SUM(CASE WHEN o.status = 'received' THEN 1 ELSE 0 END),
            SUM(CASE WHEN o.status = 'delayed' THEN 1 ELSE 0 END),
            ROUND(SUM(CASE WHEN o.status = 'received' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.id), 2),
            COALESCE(AVG(CASE WHEN o.status = 'delayed' THEN DATEDIFF(o.received_date, o.order_date) - o.expected_delivery_days ELSE 0 END), 0)
        FROM suppliers s
        LEFT JOIN orders o ON s.id = o.supplier_id
        GROUP BY s.id
    `);
    console.log('✅ Scores de fiabilité calculés\n');
    
    // 5. Afficher le classement
    const ranking = await db.query(`
        SELECT s.name, s.code, sr.reliability_score, sr.late_orders, sr.total_orders
        FROM supplier_reliability sr
        JOIN suppliers s ON sr.supplier_id = s.id
        ORDER BY sr.reliability_score DESC
    `);
    
    console.log('📊 CLASSEMENT DES FOURNISSEURS:');
    console.log('─'.repeat(50));
    ranking.forEach((r, i) => {
        const emoji = r.reliability_score >= 80 ? '🟢' : r.reliability_score >= 60 ? '🟡' : '🔴';
        console.log(`${i+1}. ${emoji} ${r.name} (${r.code}): ${r.reliability_score}% - ${r.late_orders}/${r.total_orders} retards`);
    });
    
    console.log('\n✅ Base de données initialisée avec succès!');
    process.exit();
}

// Exécution
seedDatabase().catch(console.error);