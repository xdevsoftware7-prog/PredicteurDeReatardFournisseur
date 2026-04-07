// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false); // Ajout d'un état de chargement

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSuppliers(), fetchGlobalStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suppliers/ranking');
      console.log("Données reçues de l'API suppliers :", response.data);
      setSuppliers(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stats/global');
      console.log("Données reçues de l'API stats :", response.data);
      setGlobalStats(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
    }
  };

  const fetchRecommendation = async (supplierId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reliability/recommendation/${supplierId}`);
      console.log("Données reçues de l'API recommandation :", response.data);
      setRecommendation(response.data.data);
    } catch (error) {
      console.error("Erreur recommandation:", error);
      alert("Impossible de charger la recommandation.");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="App">
      {/* ... (Reste du header identique) ... */}

      {loading ? (
        <div className="loader">Chargement des données...</div>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Commandes totales</h3>
              {/* Utilisation de l'optional chaining ?. pour éviter les erreurs undefined */}
              <div className="stat-value">{globalStats?.total_commandes || 0}</div>
            </div>
            {/* ... (Reste des stats) ... */}
          </div>

          <div className="dashboard">
            <div className="supplier-ranking">
              <h2>🏆 Classement des fournisseurs</h2>
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fournisseur</th>
                    <th>Score fiabilité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier, index) => (
                    <tr key={supplier.id || index}> {/* Sécurité sur la clé */}
                      <td>{index + 1}</td>
                      <td><strong>{supplier.name}</strong></td>
                      <td>
                        <div 
                          className="score-circle"
                          style={{ backgroundColor: getScoreColor(supplier.score) }}
                        >
                          {Math.round(supplier.score || 0)}%
                        </div>
                      </td>
                      <td>{supplier.total_commandes} cmd.</td>
                      <td>{supplier.avg_delay > 0 ? `+${supplier.avg_delay}j` : 'À l\'heure'}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            fetchRecommendation(supplier.id);
                          }}
                        >
                          🔍 Analyser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedSupplier && recommendation && (
              <div className="recommendation-panel">
                <h3>💡 Recommandation pour {selectedSupplier.name}</h3>
                {/* Contenu de la recommandation */}
                {selectedSupplier && recommendation && (
                <div className="recommendation-panel card">
                  <h3>💡 Analyse IA : {selectedSupplier.name}</h3>
                  <div className="grid-recommendation">
                    <div className="rec-item">
                      <span>Risque actuel</span>
                      <strong className={recommendation.risk_level}>{recommendation.risk_level}</strong>
                    </div>
                    <div className="rec-item">
                      <span>Action conseillée</span>
                      <p>{recommendation.action_text || "Ajuster le stock de sécurité"}</p>
                    </div>
                    <div className="rec-item">
                      <span>Nouveau Lead Time suggéré</span>
                      <strong>{recommendation.suggested_lead_time} jours</strong>
                    </div>
                  </div>
                </div>
              )}
                <button className="btn-close"  onClick={() => {
                   setSelectedSupplier(null);
                   setRecommendation(null); // Reset aussi la recommandation
                }}>Fermer</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;