# 📱 Guide d'Utilisation - Application Dépôt de Boissons

## 🎯 Objectif de l'Application

Cette application permet de :
1. **Gérer le stock de casiers** - Suivre les entrées et sorties
2. **Calculer automatiquement le stock restant** - Entrées - Sorties = Stock
3. **Créer des factures** pour les clients
4. **Suivre les paiements** - Marquer les factures comme payées avec le montant

---

## 📊 1. TABLEAU DE BORD

### Informations Affichées

**🔵 Stock Restant de Casiers**
- Affiche le nombre total de casiers en stock
- Calcul automatique : Total Entrées - Total Sorties

**🟢 Casiers Entrés Aujourd'hui**
- Nombre de casiers entrés dans la journée

**🟠 Casiers Sortis Aujourd'hui**
- Nombre de casiers sortis dans la journée

**🔴 Factures Impayées**
- Nombre de factures non payées
- Montant total dû

**🟣 Revenu du Mois**
- Total des paiements reçus ce mois

### Résumé des Mouvements
- **Total Entrées** : Tous les casiers entrés depuis le début
- **Total Sorties** : Tous les casiers sortis depuis le début
- **Stock Restant** : Différence entre entrées et sorties

---

## 📦 2. GESTION DES CASIERS

### Enregistrer une Entrée de Casiers

1. Cliquez sur le bouton **+** (en bas à droite)
2. Remplissez le formulaire :
   - **Client** (optionnel) : Sélectionnez le client
   - **Type de boisson** * : Ex: Coca-Cola, Sprite, Fanta
   - **Nombre de casiers** * : Ex: 10
   - **Type de mouvement** : Sélectionnez "Entrée"
   - **Prix unitaire** (optionnel) : Prix par casier
   - **Notes** (optionnel) : Informations supplémentaires
3. Cliquez sur **Ajouter**

### Enregistrer une Sortie de Casiers

1. Cliquez sur le bouton **+**
2. Remplissez le formulaire :
   - Sélectionnez **"Sortie"** comme type de mouvement
   - Remplissez les autres champs
3. Cliquez sur **Ajouter**

### Statistiques du Jour
L'écran affiche automatiquement :
- **Entrées** : Total des casiers entrés aujourd'hui (vert)
- **Sorties** : Total des casiers sortis aujourd'hui (orange)
- **Solde** : Différence du jour (bleu)

---

## 👥 3. GESTION DES CLIENTS

### Ajouter un Client

1. Cliquez sur le bouton **+**
2. Remplissez :
   - **Nom** * (requis)
   - **Prénom** * (requis)
   - **Téléphone** (optionnel)
   - **Email** (optionnel)
   - **Adresse** (optionnel)
3. Cliquez sur **Ajouter**

Les clients apparaissent sous forme de cartes avec leurs informations.

---

## 💰 4. FACTURATION

### Créer une Facture

1. Cliquez sur le bouton **+**
2. Remplissez le formulaire :
   - **Client** * : Sélectionnez le client à facturer
   - **Montant Total** * : Montant de la facture en FCFA
   - **Date d'échéance** : Date limite de paiement
   - **Année** : Année de facturation
   - **Mois** : Mois de facturation
3. Cliquez sur **Créer Facture**

### Statuts des Factures

Les factures ont 3 statuts avec des couleurs :
- 🟢 **Payée** (vert) : Montant total payé
- 🟡 **Partielle** (jaune) : Paiement partiel effectué
- 🔴 **Impayée** (rouge) : Aucun paiement

### Enregistrer un Paiement

1. Sur une facture, cliquez sur **"Enregistrer Paiement"**
2. Dans le modal :
   - **Montant payé** : Entrez le montant reçu
   - **Statut** : Sélectionnez le statut
     - "payee" si le montant total est payé
     - "partielle" si paiement partiel
     - "impayee" si aucun paiement
3. Cliquez sur **Enregistrer**

### Affichage des Factures

Chaque facture affiche :
- Nom du client
- Date de facturation
- **Total** : Montant total de la facture
- **Payé** : Montant déjà payé
- **Reste** : Montant restant à payer (en rouge)
- Badge de statut (Payée/Partielle/Impayée)

### Statistiques des Factures

En haut de l'écran :
- **Total Factures** : Somme de toutes les factures (bleu)
- **Total Payé** : Somme des paiements reçus (vert)
- **Total Impayé** : Montant restant à recevoir (rouge)

---

## 🔔 5. RAPPELS DE PAIEMENT

### Envoyer un Rappel

1. L'écran affiche les factures impayées
2. Cliquez sur **"Envoyer Rappel"** sur une facture
3. Le message est pré-rempli avec :
   - Nom du client
   - Montant dû
4. Modifiez le message si nécessaire
5. Sélectionnez le type : Email, SMS ou Téléphone
6. Cliquez sur **Envoyer**

### Historique des Rappels

Tous les rappels envoyés sont enregistrés avec :
- Date et heure
- Client concerné
- Type de rappel
- Message envoyé

---

## 📈 6. STATISTIQUES

### Graphiques Mensuels

- **Graphique en barres** : Visualisation des entrées/sorties par jour
- **Graphique en courbes** : Évolution des mouvements

### Filtres

- **Année** : Sélectionnez l'année
- **Mois** : Sélectionnez le mois

### Tableau Récapitulatif

Affiche pour chaque jour :
- Date
- Nombre d'entrées
- Nombre de sorties
- Solde du jour

---

## 🔄 FLUX DE TRAVAIL RECOMMANDÉ

### Scénario Complet

1. **Ajouter des clients**
   - Allez dans "Clients"
   - Ajoutez tous vos clients

2. **Enregistrer les mouvements de casiers**
   - Allez dans "Casiers"
   - Enregistrez chaque entrée (livraison reçue)
   - Enregistrez chaque sortie (vente/livraison client)
   - Le stock restant se calcule automatiquement

3. **Créer des factures**
   - Allez dans "Factures"
   - Créez une facture pour chaque client
   - Le montant peut être basé sur les casiers vendus

4. **Enregistrer les paiements**
   - Quand un client paie, cliquez sur "Enregistrer Paiement"
   - Entrez le montant reçu
   - La facture passe en "Payée" si le montant total est reçu

5. **Suivre les impayés**
   - Allez dans "Rappels"
   - Voyez les factures impayées
   - Envoyez des rappels aux clients

6. **Consulter les statistiques**
   - Tableau de bord : Vue d'ensemble
   - Statistiques : Graphiques détaillés

---

## ✅ POINTS CLÉS

### Stock de Casiers
- ✅ **Entrées** augmentent le stock
- ✅ **Sorties** diminuent le stock
- ✅ **Stock Restant** = Entrées - Sorties (calcul automatique)

### Factures
- ✅ Créez une facture pour chaque client
- ✅ Enregistrez les paiements au fur et à mesure
- ✅ Le statut change automatiquement selon le montant payé
- ✅ Les factures impayées apparaissent dans "Rappels"

### Données
- ✅ Toutes les données sont stockées localement sur votre téléphone
- ✅ Pas besoin de connexion internet
- ✅ Base de données SQLite sécurisée

---

## 🎯 EXEMPLE PRATIQUE

### Journée Type

**Matin - 9h00**
1. Réception de 50 casiers de Coca-Cola
   - Casiers → + → Type: Coca-Cola, Nombre: 50, Mouvement: Entrée
   - Stock passe à 50

**Après-midi - 14h00**
2. Vente de 20 casiers à Client "Dupont"
   - Casiers → + → Client: Dupont, Nombre: 20, Mouvement: Sortie
   - Stock passe à 30 (50 - 20)

**Fin de journée - 18h00**
3. Création de facture pour Dupont
   - Factures → + → Client: Dupont, Montant: 50 000 FCFA
   - Statut: Impayée

**Lendemain - 10h00**
4. Dupont paie 30 000 FCFA
   - Factures → Enregistrer Paiement → Montant: 30 000, Statut: Partielle
   - Reste à payer: 20 000 FCFA

**Plus tard**
5. Dupont paie les 20 000 FCFA restants
   - Factures → Enregistrer Paiement → Montant: 50 000, Statut: Payée
   - Facture marquée comme PAYÉE ✅

---

## 📞 SUPPORT

Pour toute question sur l'utilisation de l'application, consultez ce guide ou vérifiez les écrans de l'application qui sont intuitifs et guidés.

**Bonne gestion de votre dépôt ! 🚀**
