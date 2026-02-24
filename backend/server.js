const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

let pool;
let connectionAttempts = 0;
const maxAttempts = 30;

function connectToDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "database",
    user: process.env.DB_USER || "app_user",
    password: process.env.DB_PASSWORD || "app_password",
    database: process.env.DB_NAME || "tasksdb",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test database connection
  pool.getConnection((err, connection) => {
    if (err) {
      connectionAttempts++;
      console.error(`❌ Database connection failed (attempt ${connectionAttempts}/${maxAttempts}):`, err.message);
      
      if (connectionAttempts < maxAttempts) {
        console.log(`⏳ Retrying in 2 seconds...`);
        setTimeout(connectToDatabase, 2000);
      } else {
        console.error(`❌ Failed to connect to database after ${maxAttempts} attempts. Exiting...`);
        process.exit(1);
      }
    } else {
      console.log("✅ Database connected successfully");
      connectionAttempts = 0;
      connection.release();
    }
  });
}

// Initial connection attempt
connectToDatabase();

// Health check
app.get("/health", (req, res) => {
  // Check if pool is initialized
  if (!pool) {
    return res.status(503).json({ status: "ERROR", database: "not connected" });
  }
  
  // Test connection by getting a connection and releasing it
  pool.getConnection((err, connection) => {
    if (err) {
      return res.status(503).json({ status: "ERROR", database: "disconnected", error: err.message });
    }
    connection.release();
    res.json({ status: "OK", database: "connected" });
  });
});

// Récupérer toutes les tâches
app.get("/api/tasks", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database not connected" });
  }
  
  pool.query("SELECT * FROM tasks ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Ajouter une tâche
app.post("/api/tasks", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database not connected" });
  }
  
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title et description requis" });
  }

  pool.query(
    "INSERT INTO tasks (title, description) VALUES (?, ?)",
    [title, description],
    (err, results) => {
      if (err) {
        console.error("Error inserting task:", err);
        return res.status(500).json({ error: err.message });
      }

      pool.query("SELECT * FROM tasks WHERE id = ?", [results.insertId], (err2, rows) => {
        if (err2) {
          console.error("Error fetching new task:", err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json(rows[0]);
      });
    }
  );
});

// Add a test endpoint to verify the table exists
app.get("/api/test", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database not connected" });
  }
  
  pool.query("SHOW TABLES", (err, tables) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ tables });
  });
});
// Supprimer une tâche
app.delete("/api/tasks/:id", (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database not connected" });
  }
  
  const { id } = req.params;
  
  pool.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({ message: "Task deleted successfully", id });
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));