-- Créer la base de données
CREATE DATABASE IF NOT EXISTS personnes_db;
USE personnes_db;

-- Créer la table avec les 3 champs
CREATE TABLE IF NOT EXISTS personnes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donner les droits
GRANT ALL PRIVILEGES ON personnes_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Insérer des données d'exemple
INSERT INTO personnes (nom, prenom, age) VALUES
    ('Dupont', 'Jean', 25),
    ('Martin', 'Sophie', 32),
    ('Dubois', 'Pierre', 45),
    ('Bernard', 'Marie', 28);