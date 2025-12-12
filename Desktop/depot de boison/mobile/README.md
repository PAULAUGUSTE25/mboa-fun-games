# Application Mobile - Gestion Dépôt de Boissons (Android)

Application mobile Android développée avec React Native et Expo pour la gestion complète d'un dépôt de boissons.

## 📱 Fonctionnalités

- ✅ **Tableau de bord** avec statistiques en temps réel
- ✅ **Gestion des casiers** (entrées/sorties)
- ✅ **Gestion des clients** avec informations complètes
- ✅ **Facturation** avec suivi des paiements
- ✅ **Système de rappels** pour clients impayés
- ✅ **Statistiques et graphiques** mensuels
- ✅ **Base de données locale SQLite** (fonctionne hors ligne)

## 🚀 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Pour tester sur Android :
  - Android Studio avec émulateur configuré, OU
  - Application Expo Go sur votre téléphone Android

### Étapes d'installation

1. **Installer les dépendances** :
```bash
cd mobile
npm install
```

2. **Lancer l'application** :
```bash
npm start
```

3. **Tester l'application** :
   - **Sur émulateur Android** : Appuyez sur `a` dans le terminal
   - **Sur téléphone physique** : 
     1. Installez l'app "Expo Go" depuis le Play Store
     2. Scannez le QR code affiché dans le terminal

## 📦 Build APK pour Android

Pour créer un fichier APK installable :

```bash
# Build APK
expo build:android

# Ou avec EAS Build (recommandé)
npm install -g eas-cli
eas build --platform android
```

## 🎨 Technologies Utilisées

- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **React Native Paper** - Composants UI Material Design
- **React Navigation** - Navigation entre écrans
- **Expo SQLite** - Base de données locale
- **React Native Chart Kit** - Graphiques et statistiques
- **React Native Vector Icons** - Icônes

## 📂 Structure du Projet

```
mobile/
├── App.js                      # Point d'entrée de l'application
├── app.json                    # Configuration Expo
├── src/
│   ├── screens/               # Écrans de l'application
│   │   ├── DashboardScreen.js
│   │   ├── CasiersScreen.js
│   │   ├── ClientsScreen.js
│   │   ├── FacturesScreen.js
│   │   ├── RappelsScreen.js
│   │   └── StatistiquesScreen.js
│   └── services/
│       └── database.js        # Service de base de données SQLite
└── package.json
```

## 💾 Base de Données

L'application utilise SQLite pour stocker toutes les données localement sur l'appareil :
- Clients
- Casiers (mouvements)
- Factures
- Rappels

Les données sont persistantes et disponibles même hors ligne.

## 🎯 Utilisation

### Tableau de Bord
Affiche les statistiques principales :
- Nombre total de clients
- Casiers entrés/sortis aujourd'hui
- Factures impayées
- Revenu du mois

### Gestion des Casiers
- Enregistrer les entrées et sorties de casiers
- Associer à un client (optionnel)
- Suivre le type de boisson et la quantité
- Visualiser le solde en temps réel

### Gestion des Clients
- Ajouter de nouveaux clients
- Enregistrer les coordonnées complètes
- Visualiser la liste des clients

### Factures
- Créer des factures pour les clients
- Enregistrer les paiements
- Suivre le statut (impayée, partielle, payée)
- Filtrer par année

### Rappels
- Voir les clients avec factures impayées
- Envoyer des rappels personnalisés
- Historique complet des rappels

### Statistiques
- Graphiques en barres et courbes
- Données mensuelles détaillées
- Tableaux récapitulatifs
- Filtrage par année et mois

## 🔧 Personnalisation

Pour modifier les couleurs de l'application, éditez les valeurs dans chaque fichier de style ou créez un fichier de thème centralisé.

## 📱 Compatibilité

- Android 5.0 (API 21) et supérieur
- iOS 11 et supérieur (si vous souhaitez déployer sur iOS)

## 🐛 Dépannage

### Problème : L'application ne se lance pas
```bash
# Nettoyer le cache
expo start -c
```

### Problème : Erreurs de dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

## 📄 Licence

Ce projet est développé pour la gestion de dépôts de boissons.
