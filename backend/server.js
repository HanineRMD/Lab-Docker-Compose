const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("=".repeat(60));
console.log("🚀 BACKEND DÉMARRAGE - GESTION DE PERSONNES");
console.log("=".repeat(60));

let pool;
let connectionAttempts = 0;
const maxAttempts = 30;

function connectToDatabase() {
  const config = {
    host: process.env.DB_HOST || "database",
    user: process.env.DB_USER || "app_user",
    password: process.env.DB_PASSWORD || "app_password",
    database: process.env.DB_NAME || "personnes_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
  };

  console.log("📦 Configuration MySQL:", {
    host: config.host,
    user: config.user,
    database: config.database
  });

  pool = mysql.createPool(config);

  pool.getConnection((err, connection) => {
    if (err) {
      connectionAttempts++;
      console.error(`❌ Connexion échouée (${connectionAttempts}/${maxAttempts}):`, err.message);
      
      if (connectionAttempts < maxAttempts) {
        console.log("⏳ Nouvelle tentative dans 3 secondes...");
        setTimeout(connectToDatabase, 3000);
      }
    } else {
      console.log("✅ Connecté à MySQL avec succès!");
      
      // Créer la table si elle n'existe pas
      connection.query(`
        CREATE TABLE IF NOT EXISTS personnes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          prenom VARCHAR(100) NOT NULL,
          age INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error("❌ Erreur création table:", err);
        } else {
          console.log("✅ Table 'personnes' prête");
          
          // Vérifier si la table est vide
          connection.query("SELECT COUNT(*) as count FROM personnes", (err, results) => {
            if (!err && results[0].count === 0) {
              // Insérer des données de test
              const sampleData = [
                ['Dupont', 'Jean', 25],
                ['Martin', 'Sophie', 32],
                ['Dubois', 'Pierre', 45]
              ];
              connection.query(
                "INSERT INTO personnes (nom, prenom, age) VALUES ?",
                [sampleData],
                (err) => {
                  if (!err) console.log("✅ Données de test insérées");
                }
              );
            }
          });
        }
        connection.release();
      });
      
      connectionAttempts = 0;
    }
  });
}

connectToDatabase();

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Route de test
app.get("/", (req, res) => {
  res.json({ 
    message: "API Gestion de Personnes",
    version: "1.0.0",
    endpoints: {
      GET: "/api/personnes - Liste toutes les personnes",
      GET: "/api/personnes/:id - Détail d'une personne",
      POST: "/api/personnes - Ajouter une personne",
      PUT: "/api/personnes/:id - Modifier une personne",
      DELETE: "/api/personnes/:id - Supprimer une personne"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  if (!pool) {
    return res.status(503).json({ 
      status: "ERROR", 
      database: "not connected",
      timestamp: new Date().toISOString()
    });
  }
  
  pool.getConnection((err, connection) => {
    if (err) {
      return res.status(503).json({ 
        status: "ERROR", 
        database: "disconnected",
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
    connection.release();
    res.json({ 
      status: "OK", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  });
});

// GET - Récupérer toutes les personnes
app.get("/api/personnes", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Base de données non connectée" });
  }
  
  pool.query("SELECT * FROM personnes ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("❌ Erreur SELECT:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`✅ ${results.length} personnes récupérées`);
    res.json(results);
  });
});

// GET - Récupérer une personne par ID
app.get("/api/personnes/:id", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Base de données non connectée" });
  }
  
  const { id } = req.params;
  
  pool.query("SELECT * FROM personnes WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Erreur SELECT:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Personne non trouvée" });
    }
    
    res.json(results[0]);
  });
});

// POST - Ajouter une personne
app.post("/api/personnes", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Base de données non connectée" });
  }
  
  const { nom, prenom, age } = req.body;
  
  // Validation
  if (!nom || !prenom || !age) {
    return res.status(400).json({ 
      error: "Tous les champs sont requis",
      required: ["nom", "prenom", "age"]
    });
  }

  if (isNaN(age) || age < 1 || age > 120) {
    return res.status(400).json({ error: "L'âge doit être un nombre entre 1 et 120" });
  }

  console.log("📝 Ajout d'une personne:", { nom, prenom, age });

  pool.query(
    "INSERT INTO personnes (nom, prenom, age) VALUES (?, ?, ?)",
    [nom, prenom, age],
    (err, results) => {
      if (err) {
        console.error("❌ Erreur INSERT:", err);
        return res.status(500).json({ error: err.message });
      }

      pool.query("SELECT * FROM personnes WHERE id = ?", [results.insertId], (err2, rows) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        console.log("✅ Personne ajoutée:", rows[0]);
        res.status(201).json(rows[0]);
      });
    }
  );
});

// PUT - Modifier une personne
app.put("/api/personnes/:id", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Base de données non connectée" });
  }
  
  const { id } = req.params;
  const { nom, prenom, age } = req.body;

  // Validation
  if (!nom || !prenom || !age) {
    return res.status(400).json({ 
      error: "Tous les champs sont requis",
      required: ["nom", "prenom", "age"]
    });
  }

  if (isNaN(age) || age < 1 || age > 120) {
    return res.status(400).json({ error: "L'âge doit être un nombre entre 1 et 120" });
  }

  console.log("📝 Modification personne ID:", id, { nom, prenom, age });

  pool.query(
    "UPDATE personnes SET nom = ?, prenom = ?, age = ? WHERE id = ?",
    [nom, prenom, age, id],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur UPDATE:", err);
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Personne non trouvée" });
      }

      pool.query("SELECT * FROM personnes WHERE id = ?", [id], (err2, rows) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        console.log("✅ Personne modifiée:", rows[0]);
        res.json(rows[0]);
      });
    }
  );
});

// DELETE - Supprimer une personne
app.delete("/api/personnes/:id", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Base de données non connectée" });
  }
  
  const { id } = req.params;
  
  console.log("🗑️ Suppression personne ID:", id);

  pool.query("DELETE FROM personnes WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Erreur DELETE:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Personne non trouvée" });
    }
    
    console.log("✅ Personne supprimée ID:", id);
    res.json({ 
      message: "Personne supprimée avec succès", 
      id: parseInt(id) 
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("=".repeat(60));
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🌐 http://localhost:${PORT}/health`);
  console.log(`🌐 http://localhost:${PORT}/api/personnes`);
  console.log("=".repeat(60));
});