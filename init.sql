-- Create the database if it doesn't exist (though it's already created by MYSQL_DATABASE)
CREATE DATABASE IF NOT EXISTS tasksdb;
USE tasksdb;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant privileges to the app user
GRANT ALL PRIVILEGES ON tasksdb.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Insert some sample data
INSERT INTO tasks (title, description) VALUES 
    ('Première tâche', 'Description de la première tâche'),
    ('Deuxième tâche', 'Description de la deuxième tâche');