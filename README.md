# Lab-Docker-Compose 🐳

Application Todo List complète avec Docker Compose : React.js, Node.js/Express et MySQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=flat&logo=mysql&logoColor=white)

## 📋 Table des matières
- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Captures d'écran](#captures-décran)
- [Dépannage](#dépannage)
- [Commandes utiles](#commandes-utiles)
- [Auteur](#auteur)

## 🎯 Aperçu

Ce projet est une application de gestion de tâches (Todo List) conteneurisée avec Docker Compose. Elle démontre comment orchestrer trois services :
- **Frontend** : Application React servie par Nginx
- **Backend** : API REST avec Node.js/Express
- **Base de données** : MySQL pour la persistance des données

L'application permet de créer, lister et supprimer des tâches avec une interface moderne et responsive.

## ✨ Fonctionnalités

- ✅ **Ajouter** une nouvelle tâche (titre + description)
- ✅ **Lister** toutes les tâches existantes
- ✅ **Supprimer** une tâche
- ✅ **Statut** des tâches (pending/completed)
- ✅ **Interface moderne** et responsive avec animations CSS
- ✅ **Santé de l'application** : vérification de la connexion à la base de données
- ✅ **Dockerisation complète** avec gestion des réseaux et volumes
- ✅ **Persistance des données** avec volume Docker
- ✅ **Variables d'environnement** pour la configuration

## 🛠 Technologies utilisées

| Service | Technologie | Version |
|---------|------------|---------|
| Frontend | React.js | 18.2.0 |
| Backend | Node.js/Express | 20-alpine |
| Base de données | MySQL | 8.4.8 |
| Serveur web | Nginx | Alpine |
| Conteneurisation | Docker Compose | 3.x |
| Langage | JavaScript | ES6+ |
| HTTP Client | Axios | 1.6.2 |

## 📦 Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (version 20.10+)
- [Git](https://git-scm.com/) (optionnel, pour cloner)
- 2-4 Go d'espace disque disponible
- Connexion internet pour le premier build
- WSL2 (pour Windows) ou système Linux/Mac

## 🚀 Installation et lancement

### 1. Cloner le projet
git clone https://github.com/HanineRMD/Lab-Docker-Compose.git
cd Lab-Docker-Compose

2. Créer le fichier d'environnement
Créez un fichier .env à la racine :

env
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=tasksdb
DB_HOST=database
DB_PORT=3306
PORT=3000
3. Lancer l'application
bash
# Premier lancement (avec build)
docker-compose up --build

# Ou en mode détaché (arrière-plan)
docker-compose up -d --build

# Pour voir les logs en temps réel
docker-compose logs -f
4. Accéder à l'application
Frontend : http://localhost:8080

Backend API : http://localhost:3001

Base de données : localhost:3308 (connexion directe avec MySQL client)

5. Arrêter l'application
bash
# Arrêter les conteneurs
docker-compose down

# Arrêter et supprimer les volumes (données)
docker-compose down -v
📁 Structure du projet
text
Lab-Docker-Compose/
├── 📂 backend/
│   ├── 📄 Dockerfile
│   ├── 📄 server.js
│   ├── 📄 package.json
│   └── 📄 package-lock.json
├── 📂 frontend/
│   ├── 📂 public/
│   │   ├── 📄 index.html
│   │   ├── 📄 manifest.json
│   │   └── 📄 robots.txt
│   ├── 📂 src/
│   │   ├── 📄 App.css
│   │   ├── 📄 App.js
│   │   ├── 📄 App.test.js
│   │   ├── 📄 index.css
│   │   ├── 📄 index.js
│   │   ├── 📄 logo.svg
│   │   ├── 📄 reportWebVitals.js
│   │   └── 📄 setupTests.js
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   └── 📄 package-lock.json
├── 📂 screenshot/
│   ├── 🖼️ 1.png
│   └── 🖼️ 2.png
├── 📄 docker-compose.yml
├── 📄 init.sql
├── 📄 .env
├── 📄 .gitignore
└── 📄 README.md
🌐 API Endpoints
Méthode	Endpoint	Description	Corps de la requête
GET	/health	Vérifier la santé du serveur et de la DB	-
GET	/api/tasks	Récupérer toutes les tâches	-
POST	/api/tasks	Ajouter une nouvelle tâche	{ "title": "...", "description": "..." }
DELETE	/api/tasks/:id	Supprimer une tâche par ID	-
GET	/api/test	Tester la connexion à la base de données	-
📸 Captures d'écran
Page d'accueil avec la liste des tâches
![](screenshot/1.png)

Capture d'écran 1 : Interface principale de l'application avec le formulaire d'ajout, le bouton de test de connexion et la liste des tâches

Exemple d'utilisation avec tâches ajoutées
![](screenshot/2.png)

Capture d'écran 2 : Affichage des tâches avec les boutons de suppression, le compteur de tâches et le design moderne avec dégradés

🛠 Dépannage
Problème : La base de données ne se connecte pas
bash
# Vérifier les logs de la base de données
docker-compose logs database

# Vérifier que MySQL est prêt
docker-compose ps

# Redémarrer le backend
docker-compose restart backend
Problème : Le frontend ne se connecte pas au backend (erreur 404)
bash
# Vérifier la variable d'environnement dans le conteneur
docker exec -it lab-docker-compose-frontend-1 sh
echo $REACT_APP_API_URL

# Tester la connexion depuis le conteneur frontend
wget -qO- http://backend:3000/health

# Reconstruire avec les bonnes variables
docker-compose down
docker-compose up --build
Problème : Ports déjà utilisés
bash
# Vérifier les processus utilisant les ports
netstat -ano | findstr :8080
netstat -ano | findstr :3001
netstat -ano | findstr :3308

# Modifier les ports dans docker-compose.yml si nécessaire
Reconstruire complètement l'application
bash
# Nettoyage complet
docker-compose down -v
docker system prune -af --volumes
docker-compose up --build
📊 Commandes utiles
Gestion des conteneurs
bash
# Lister les conteneurs en cours
docker ps

# Lister tous les conteneurs (même arrêtés)
docker ps -a

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs database
docker-compose logs frontend

# Suivre les logs en temps réel
docker-compose logs -f
Accès aux conteneurs
bash
# Accéder au shell du backend
docker exec -it lab-docker-compose-backend-1 sh

# Accéder au shell de la base de données
docker exec -it lab-docker-compose-database-1 bash

# Accéder à MySQL
docker exec -it lab-docker-compose-database-1 mysql -u app_user -papp_password tasksdb
Tests des API
bash
# Tester la santé
curl http://localhost:3001/health

# Récupérer les tâches
curl http://localhost:3001/api/tasks

# Ajouter une tâche
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Description test"}'

# Supprimer une tâche (remplacer 1 par l'ID)
curl -X DELETE http://localhost:3001/api/tasks/1
Monitoring
bash
# Voir l'utilisation des ressources
docker stats

# Voir l'espace disque utilisé par Docker
docker system df

# Nettoyer les ressources inutilisées
docker system prune -af
🔧 Configuration avancée
Variables d'environnement disponibles
Variable	Description	Valeur par défaut
DB_USER	Utilisateur MySQL	app_user
DB_PASSWORD	Mot de passe MySQL	app_password
DB_NAME	Nom de la base de données	tasksdb
DB_HOST	Hôte MySQL	database
DB_PORT	Port MySQL	3306
PORT	Port du backend	3000
REACT_APP_API_URL	URL de l'API pour le frontend	http://localhost:3001
Modification des ports
Si vous voulez changer les ports exposés, modifiez docker-compose.yml :

yaml
ports:
  - "8081:80"  # Frontend sur 8081 au lieu de 8080
  - "3002:3000" # Backend sur 3002 au lieu de 3001
  - "3309:3306" # MySQL sur 3309 au lieu de 3308
🤝 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à :

Fork le projet

Créer une branche (git checkout -b feature/AmazingFeature)

Commit les changements (git commit -m 'Add some AmazingFeature')

Push la branche (git push origin feature/AmazingFeature)

Ouvrir une Pull Request

👩‍💻 Auteur
HanineRMD

GitHub : @HanineRMD

Projet : Lab-Docker-Compose
