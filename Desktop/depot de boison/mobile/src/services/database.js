import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';

let db = null;

const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('depot.db');
  }
  return db;
};

// Migration de la base de données existante
const migrateDatabase = async (database) => {
  try {
    console.log('[Database] Vérification des migrations...');
    
    // Vérifier si les nouvelles colonnes existent déjà
    const tableInfo = await database.getAllAsync("PRAGMA table_info(clients)");
    const colonnesExistantes = tableInfo.map(col => col.name);
    
    console.log('[Database] Colonnes existantes dans clients:', colonnesExistantes);
    
    // Ajouter les colonnes manquantes à la table clients
    const nouvellesColonnesClients = [
      { nom: 'ville', type: 'TEXT' },
      { nom: 'code_postal', type: 'TEXT' },
      { nom: 'limite_credit', type: 'REAL DEFAULT 0' },
      { nom: 'credit_utilise', type: 'REAL DEFAULT 0' },
      { nom: 'actif', type: 'INTEGER DEFAULT 1' },
      { nom: 'notes', type: 'TEXT' },
      { nom: 'date_modification', type: 'DATETIME' }
    ];
    
    for (const col of nouvellesColonnesClients) {
      if (!colonnesExistantes.includes(col.nom)) {
        console.log(`[Database] Ajout colonne clients.${col.nom}`);
        await database.execAsync(`ALTER TABLE clients ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    // Vérifier et migrer la table casiers
    const casiersInfo = await database.getAllAsync("PRAGMA table_info(casiers)");
    const colonnesCasiers = casiersInfo.map(col => col.name);
    
    const nouvellesColonnesCasiers = [
      { nom: 'utilisateur', type: 'TEXT' },
      { nom: 'reference', type: 'TEXT' },
      { nom: 'date_creation', type: 'DATETIME' },
      { nom: 'date_modification', type: 'DATETIME' }
    ];
    
    for (const col of nouvellesColonnesCasiers) {
      if (!colonnesCasiers.includes(col.nom)) {
        console.log(`[Database] Ajout colonne casiers.${col.nom}`);
        await database.execAsync(`ALTER TABLE casiers ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    // Vérifier et migrer la table factures
    const facturesInfo = await database.getAllAsync("PRAGMA table_info(factures)");
    const colonnesFactures = facturesInfo.map(col => col.name);
    
    const nouvellesColonnesFactures = [
      { nom: 'numero_facture', type: 'TEXT' },
      { nom: 'nom_manuel', type: 'TEXT' },
      { nom: 'montant_remise', type: 'REAL DEFAULT 0' },
      { nom: 'taux_tva', type: 'REAL DEFAULT 0' },
      { nom: 'montant_tva', type: 'REAL DEFAULT 0' },
      { nom: 'date_paiement', type: 'DATETIME' },
      { nom: 'mode_paiement', type: 'TEXT' },
      { nom: 'notes', type: 'TEXT' },
      { nom: 'date_creation', type: 'DATETIME' },
      { nom: 'date_modification', type: 'DATETIME' }
    ];
    
    for (const col of nouvellesColonnesFactures) {
      if (!colonnesFactures.includes(col.nom)) {
        console.log(`[Database] Ajout colonne factures.${col.nom}`);
        await database.execAsync(`ALTER TABLE factures ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    // Vérifier et migrer la table types_boissons
    const typesInfo = await database.getAllAsync("PRAGMA table_info(types_boissons)");
    const colonnesTypes = typesInfo.map(col => col.name);
    
    const nouvellesColonnesTypes = [
      { nom: 'code_produit', type: 'TEXT' },
      { nom: 'categorie', type: 'TEXT' },
      { nom: 'stock_minimum', type: 'INTEGER DEFAULT 0' },
      { nom: 'stock_maximum', type: 'INTEGER DEFAULT 1000' },
      { nom: 'volume_ml', type: 'INTEGER' },
      { nom: 'fournisseur', type: 'TEXT' },
      { nom: 'date_creation', type: 'DATETIME' },
      { nom: 'date_modification', type: 'DATETIME' }
    ];
    
    for (const col of nouvellesColonnesTypes) {
      if (!colonnesTypes.includes(col.nom)) {
        console.log(`[Database] Ajout colonne types_boissons.${col.nom}`);
        await database.execAsync(`ALTER TABLE types_boissons ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    // Vérifier et migrer la table stock_quotidien
    const stockInfo = await database.getAllAsync("PRAGMA table_info(stock_quotidien)");
    const colonnesStock = stockInfo.map(col => col.name);
    
    const nouvellesColonnesStock = [
      { nom: 'pertes', type: 'INTEGER DEFAULT 0' },
      { nom: 'ajustements', type: 'INTEGER DEFAULT 0' },
      { nom: 'valeur_stock', type: 'REAL DEFAULT 0' },
      { nom: 'notes', type: 'TEXT' },
      { nom: 'verifie', type: 'INTEGER DEFAULT 0' },
      { nom: 'date_verification', type: 'DATETIME' }
    ];
    
    for (const col of nouvellesColonnesStock) {
      if (!colonnesStock.includes(col.nom)) {
        console.log(`[Database] Ajout colonne stock_quotidien.${col.nom}`);
        await database.execAsync(`ALTER TABLE stock_quotidien ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    // Vérifier et migrer la table rappels
    const rappelsInfo = await database.getAllAsync("PRAGMA table_info(rappels)");
    const colonnesRappels = rappelsInfo.map(col => col.name);
    
    const nouvellesColonnesRappels = [
      { nom: 'date_reponse', type: 'DATETIME' },
      { nom: 'notes_reponse', type: 'TEXT' }
    ];
    
    for (const col of nouvellesColonnesRappels) {
      if (!colonnesRappels.includes(col.nom)) {
        console.log(`[Database] Ajout colonne rappels.${col.nom}`);
        await database.execAsync(`ALTER TABLE rappels ADD COLUMN ${col.nom} ${col.type}`);
      }
    }
    
    console.log('[Database] Migration terminée avec succès');
  } catch (error) {
    console.error('[Database] Erreur lors de la migration:', error);
    // Ne pas bloquer l'initialisation si la migration échoue
  }
};

export const initDatabase = async () => {
  try {
    console.log('[Database] Initialisation de la base de données avancée...');
    const database = await initDB();
    
    // Vérifier et migrer les tables existantes
    await migrateDatabase(database);
    
    await database.execAsync(`
      -- ============================================
      -- TABLE: clients (avec champs avancés)
      -- ============================================
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        telephone TEXT,
        email TEXT UNIQUE,
        adresse TEXT,
        ville TEXT,
        code_postal TEXT,
        limite_credit REAL DEFAULT 0,
        credit_utilise REAL DEFAULT 0,
        actif INTEGER DEFAULT 1,
        notes TEXT,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_credit CHECK (credit_utilise <= limite_credit)
      );

      -- ============================================
      -- TABLE: casiers (avec traçabilité)
      -- ============================================

      CREATE TABLE IF NOT EXISTS casiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        type_boisson TEXT NOT NULL,
        nombre_casiers INTEGER NOT NULL CHECK (nombre_casiers > 0),
        type_mouvement TEXT NOT NULL CHECK (type_mouvement IN ('entree', 'sortie')),
        date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
        prix_unitaire REAL CHECK (prix_unitaire >= 0),
        notes TEXT,
        statut TEXT DEFAULT 'confirme' CHECK (statut IN ('confirme', 'annule', 'en_attente')),
        facture_id INTEGER,
        utilisateur TEXT,
        reference TEXT UNIQUE,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE SET NULL
      );

      -- ============================================
      -- TABLE: factures (avec gestion avancée)
      -- ============================================

      CREATE TABLE IF NOT EXISTS factures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_facture TEXT UNIQUE,
        client_id INTEGER,
        nom_manuel TEXT,
        montant_total REAL NOT NULL CHECK (montant_total >= 0),
        montant_paye REAL DEFAULT 0 CHECK (montant_paye >= 0),
        montant_remise REAL DEFAULT 0 CHECK (montant_remise >= 0),
        taux_tva REAL DEFAULT 0,
        montant_tva REAL DEFAULT 0,
        statut TEXT DEFAULT 'impayee' CHECK (statut IN ('payee', 'impayee', 'partielle', 'annulee')),
        date_facture DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_echeance DATETIME,
        date_paiement DATETIME,
        mode_paiement TEXT,
        notes TEXT,
        annee INTEGER,
        mois INTEGER,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        CONSTRAINT check_paiement CHECK (montant_paye <= montant_total)
      );

      -- ============================================
      -- TABLE: paiements (historique des paiements)
      -- ============================================
      CREATE TABLE IF NOT EXISTS paiements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        facture_id INTEGER NOT NULL,
        montant REAL NOT NULL CHECK (montant > 0),
        mode_paiement TEXT NOT NULL,
        reference_paiement TEXT,
        date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
      );

      -- ============================================
      -- TABLE: rappels (avec suivi)
      -- ============================================

      CREATE TABLE IF NOT EXISTS rappels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        facture_id INTEGER,
        client_id INTEGER,
        date_rappel DATETIME DEFAULT CURRENT_TIMESTAMP,
        type_rappel TEXT CHECK (type_rappel IN ('email', 'sms', 'appel', 'visite')),
        message TEXT,
        statut TEXT DEFAULT 'envoye' CHECK (statut IN ('envoye', 'lu', 'ignore', 'repondu')),
        date_reponse DATETIME,
        notes_reponse TEXT,
        FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );

      -- ============================================
      -- TABLE: types_boissons (avec gestion stock)
      -- ============================================

      CREATE TABLE IF NOT EXISTS types_boissons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE,
        code_produit TEXT UNIQUE,
        categorie TEXT,
        prix_achat REAL NOT NULL CHECK (prix_achat >= 0),
        prix_vente REAL NOT NULL CHECK (prix_vente >= prix_achat),
        quantite_par_unite INTEGER DEFAULT 12 CHECK (quantite_par_unite > 0),
        stock_minimum INTEGER DEFAULT 0,
        stock_maximum INTEGER DEFAULT 1000,
        type_contenant TEXT DEFAULT 'casier',
        volume_ml INTEGER,
        fournisseur TEXT,
        actif INTEGER DEFAULT 1,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- TABLE: stock_quotidien (avec audit)
      -- ============================================

      CREATE TABLE IF NOT EXISTS stock_quotidien (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_stock DATE NOT NULL,
        type_boisson TEXT NOT NULL,
        stock_debut INTEGER DEFAULT 0 CHECK (stock_debut >= 0),
        stock_fin INTEGER DEFAULT 0 CHECK (stock_fin >= 0),
        entrees INTEGER DEFAULT 0 CHECK (entrees >= 0),
        sorties INTEGER DEFAULT 0 CHECK (sorties >= 0),
        pertes INTEGER DEFAULT 0 CHECK (pertes >= 0),
        ajustements INTEGER DEFAULT 0,
        valeur_stock REAL DEFAULT 0,
        notes TEXT,
        verifie INTEGER DEFAULT 0,
        date_verification DATETIME,
        UNIQUE(date_stock, type_boisson)
      );

      -- ============================================
      -- TABLE: audit_log (traçabilité complète)
      -- ============================================
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
        old_values TEXT,
        new_values TEXT,
        utilisateur TEXT,
        date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT
      );

      -- ============================================
      -- TABLE: parametres (configuration système)
      -- ============================================
      CREATE TABLE IF NOT EXISTS parametres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cle TEXT NOT NULL UNIQUE,
        valeur TEXT,
        type TEXT DEFAULT 'string',
        description TEXT,
        date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- INDEX pour optimisation des performances
      -- ============================================
      CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom, prenom);
      CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
      CREATE INDEX IF NOT EXISTS idx_clients_actif ON clients(actif);
      
      CREATE INDEX IF NOT EXISTS idx_casiers_date ON casiers(date_mouvement);
      CREATE INDEX IF NOT EXISTS idx_casiers_client ON casiers(client_id);
      CREATE INDEX IF NOT EXISTS idx_casiers_type ON casiers(type_boisson);
      CREATE INDEX IF NOT EXISTS idx_casiers_mouvement ON casiers(type_mouvement);
      CREATE INDEX IF NOT EXISTS idx_casiers_statut ON casiers(statut);
      
      CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);
      CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
      CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_facture);
      CREATE INDEX IF NOT EXISTS idx_factures_echeance ON factures(date_echeance);
      CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero_facture);
      
      CREATE INDEX IF NOT EXISTS idx_paiements_facture ON paiements(facture_id);
      CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements(date_paiement);
      
      CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_quotidien(date_stock);
      CREATE INDEX IF NOT EXISTS idx_stock_type ON stock_quotidien(type_boisson);
      
      CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name, record_id);
      CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(date_action);
    `);

    return database;
  } catch (error) {
    console.error('Erreur initialisation DB:', error);
    throw error;
  }
};

export const executeQuery = async (sql, params = []) => {
  try {
    const database = await initDB();
    const result = await database.getAllAsync(sql, params);
    return result;
  } catch (error) {
    console.error('Erreur executeQuery:', error);
    throw error;
  }
};

export const initDefaultDrinkTypes = async () => {
  try {
    const existing = await executeQuery('SELECT COUNT(*) as count FROM types_boissons');
    if (existing[0].count === 0) {
      const types = [
        { nom: '"33" EXPORT', achat: 7000, vente: 7800 },
        { nom: 'CASTEL', achat: 7000, vente: 7800 },
        { nom: 'ISEMBECK', achat: 8500, vente: 9200 },
        { nom: 'DOPPEL', achat: 7000, vente: 7800 },
        { nom: 'MANYANG', achat: 5500, vente: 6000 },
        { nom: 'MUTZIK', achat: 7000, vente: 7800 },
        { nom: 'BEAUFORT LIGHT', achat: 7000, vente: 7500 },
        { nom: 'BEAUFORT', achat: 7000, vente: 7500 },
        { nom: 'GUINNESS', achat: 10000, vente: 11000 },
        { nom: 'HEINEKEN', achat: 9000, vente: 10000 }
      ];

      const database = await initDB();
      for (const type of types) {
        await database.runAsync(
          'INSERT INTO types_boissons (nom, prix_achat, prix_vente) VALUES (?, ?, ?)',
          [type.nom, type.achat, type.vente]
        );
      }
    }
  } catch (error) {
    console.error('Erreur initDefaultDrinkTypes:', error);
  }
};

export const getClients = async () => {
  return await executeQuery('SELECT * FROM clients ORDER BY nom, prenom');
};

export const addClient = async (client) => {
  try {
    console.log('[Database] addClient - Données:', client);
    const database = await initDB();
    const result = await database.runAsync(
      'INSERT INTO clients (nom, prenom, telephone, email, adresse) VALUES (?, ?, ?, ?, ?)',
      [client.nom, client.prenom || '', client.telephone || null, client.email || null, client.adresse || null]
    );
    console.log('[Database] addClient - Succès, ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Database] addClient - ERREUR:', error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    console.log('[Database] deleteClient - ID:', id);
    const database = await initDB();
    await database.runAsync('DELETE FROM clients WHERE id = ?', [id]);
    console.log('[Database] deleteClient - Succès');
  } catch (error) {
    console.error('[Database] deleteClient - ERREUR:', error);
    throw error;
  }
};

export const getCasiers = async (filters = {}) => {
  let query = 'SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom FROM casiers c LEFT JOIN clients cl ON c.client_id = cl.id WHERE 1=1';
  const params = [];

  if (filters.date_debut) {
    query += ' AND date(c.date_mouvement) >= date(?)';
    params.push(filters.date_debut);
  }

  if (filters.date_fin) {
    query += ' AND date(c.date_mouvement) <= date(?)';
    params.push(filters.date_fin);
  }

  if (filters.type_mouvement) {
    query += ' AND c.type_mouvement = ?';
    params.push(filters.type_mouvement);
  }

  query += ' ORDER BY c.date_mouvement DESC LIMIT 100';

  return await executeQuery(query, params);
};

export const addCasier = async (casier) => {
  try {
    console.log('[Database] addCasier - Données:', casier);
    const database = await initDB();
    
    // Validation des données
    if (!casier.type_boisson || !casier.nombre_casiers || !casier.type_mouvement) {
      throw new Error('Données invalides: type_boisson, nombre_casiers et type_mouvement sont requis');
    }
    
    const result = await database.runAsync(
      'INSERT INTO casiers (client_id, type_boisson, nombre_casiers, type_mouvement, prix_unitaire, notes, facture_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        casier.client_id || null,
        casier.type_boisson,
        parseInt(casier.nombre_casiers) || 0,
        casier.type_mouvement,
        parseFloat(casier.prix_unitaire) || 0,
        casier.notes || null,
        casier.facture_id || null
      ]
    );
    console.log('[Database] addCasier - Succès, ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Database] addCasier - ERREUR:', error);
    throw error;
  }
};

export const deleteCasier = async (id) => {
  const database = await initDB();
  await database.runAsync('DELETE FROM casiers WHERE id = ?', [id]);
};

export const getFactures = async () => {
  console.log('[Database] getFactures - Début de la requête');
  try {
    const result = await executeQuery(
      `SELECT f.*, 
              c.nom as client_nom, 
              c.prenom as client_prenom
       FROM factures f 
       LEFT JOIN clients c ON f.client_id = c.id 
       ORDER BY f.date_facture DESC`
    );
    console.log('[Database] getFactures - Factures récupérées:', result?.length || 0);
    return result;
  } catch (error) {
    console.error('[Database] getFactures - ERREUR:', error);
    return [];
  }
};

export const addFacture = async (facture) => {
  console.log('[Database] addFacture - Données reçues:', facture);
  const database = await initDB();
  const result = await database.runAsync(
    `INSERT INTO factures (client_id, nom_manuel, montant_total, montant_paye, statut, date_echeance, notes, annee, mois) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      facture.client_id || null,
      facture.nom_manuel || null,
      facture.montant_total,
      facture.montant_paye || 0,
      facture.statut || 'impayee',
      facture.date_echeance || null,
      facture.notes || null,
      facture.annee || new Date().getFullYear(),
      facture.mois || new Date().getMonth() + 1
    ]
  );
  console.log('[Database] addFacture - Facture créée avec ID:', result.lastInsertRowId);
  return result.lastInsertRowId;
};

export const updateFacture = async (id, montant_paye, statut) => {
  console.log('[Database] updateFacture - ID:', id, 'Montant:', montant_paye, 'Statut:', statut);
  const database = await initDB();
  await database.runAsync(
    'UPDATE factures SET montant_paye = ?, statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?',
    [montant_paye, statut, id]
  );
  console.log('[Database] updateFacture - Facture mise à jour');
};

export const deleteFacture = async (id) => {
  const database = await initDB();
  await database.runAsync('DELETE FROM factures WHERE id = ?', [id]);
};

export const getRappels = async () => {
  return await executeQuery(
    `SELECT r.*, c.nom as client_nom, c.prenom as client_prenom, f.montant_total, f.montant_paye
     FROM rappels r
     LEFT JOIN clients c ON r.client_id = c.id
     LEFT JOIN factures f ON r.facture_id = f.id
     ORDER BY r.date_rappel DESC`
  );
};

export const getFacturesImpayes = async () => {
  return await executeQuery(
    `SELECT f.*, c.nom as client_nom, c.prenom as client_prenom, c.telephone
     FROM factures f
     LEFT JOIN clients c ON f.client_id = c.id
     WHERE f.statut = 'impayee' OR f.montant_paye < f.montant_total
     ORDER BY f.date_facture DESC`
  );
};

export const addRappel = async (rappel) => {
  const database = await initDB();
  const result = await database.runAsync(
    'INSERT INTO rappels (facture_id, client_id, type_rappel, message, statut) VALUES (?, ?, ?, ?, ?)',
    [rappel.facture_id, rappel.client_id, rappel.type_rappel, rappel.message, rappel.statut || 'envoye']
  );
  return result.lastInsertRowId;
};

export const getMonthlyStats = async (year, month) => {
  const query = `
    SELECT 
      date(date_mouvement) as date,
      SUM(CASE WHEN type_mouvement = 'entree' THEN nombre_casiers ELSE 0 END) as entrees,
      SUM(CASE WHEN type_mouvement = 'sortie' THEN nombre_casiers ELSE 0 END) as sorties
    FROM casiers
    WHERE strftime('%Y', date_mouvement) = ? AND strftime('%m', date_mouvement) = ?
    GROUP BY date(date_mouvement)
    ORDER BY date(date_mouvement)
  `;
  
  const monthStr = month.toString().padStart(2, '0');
  return await executeQuery(query, [year.toString(), monthStr]);
};

export const getTypesBoissons = async () => {
  return await executeQuery('SELECT * FROM types_boissons WHERE actif = 1 ORDER BY nom');
};

export const sauvegarderStockQuotidien = async (date = null) => {
  try {
    const dateStock = date || format(new Date(), 'yyyy-MM-dd');
    const types = await getTypesBoissons();

    for (const type of types) {
      const stockData = await executeQuery(
        `SELECT 
          COALESCE(SUM(CASE WHEN type_mouvement = 'entree' THEN nombre_casiers ELSE 0 END), 0) as entrees,
          COALESCE(SUM(CASE WHEN type_mouvement = 'sortie' THEN nombre_casiers ELSE 0 END), 0) as sorties
         FROM casiers
         WHERE type_boisson = ? AND date(date_mouvement) = date(?)`,
        [type.nom, dateStock]
      );

      const { entrees, sorties } = stockData[0] || { entrees: 0, sorties: 0 };

      const stockPrecedent = await executeQuery(
        `SELECT stock_fin FROM stock_quotidien 
         WHERE type_boisson = ? AND date_stock < date(?)
         ORDER BY date_stock DESC LIMIT 1`,
        [type.nom, dateStock]
      );

      const stock_debut = stockPrecedent[0]?.stock_fin || 0;
      const stock_fin = stock_debut + entrees - sorties;

      const database = await initDB();
      await database.runAsync(
        `INSERT OR REPLACE INTO stock_quotidien 
         (date_stock, type_boisson, stock_debut, stock_fin, entrees, sorties)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dateStock, type.nom, stock_debut, stock_fin, entrees, sorties]
      );
    }
  } catch (error) {
    console.error('Erreur sauvegarderStockQuotidien:', error);
  }
};

export const getStockQuotidien = async (date = null) => {
  try {
    const dateStock = date || format(new Date(), 'yyyy-MM-dd');
    return await executeQuery(
      'SELECT * FROM stock_quotidien WHERE date_stock = date(?) ORDER BY type_boisson',
      [dateStock]
    );
  } catch (error) {
    console.error('Erreur getStockQuotidien:', error);
    return [];
  }
};

export const getHistoriqueStock = async (typeBoisson = null, jours = 30) => {
  try {
    const query = typeBoisson 
      ? `SELECT * FROM stock_quotidien 
         WHERE type_boisson = ? 
         AND date_stock >= date('now', '-${jours} days')
         ORDER BY date_stock DESC`
      : `SELECT * FROM stock_quotidien 
         WHERE date_stock >= date('now', '-${jours} days')
         ORDER BY date_stock DESC, type_boisson`;
    
    const params = typeBoisson ? [typeBoisson] : [];
    return await executeQuery(query, params);
  } catch (error) {
    console.error('Erreur getHistoriqueStock:', error);
    return [];
  }
};

export const getStockParGout = async (date = null) => {
  try {
    const dateStock = date || format(new Date(), 'yyyy-MM-dd');

    return await executeQuery(
      `SELECT 
        t.nom as type_boisson,
        COALESCE(SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END), 0) as total_entrees,
        COALESCE(SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END), 0) as total_sorties,
        COALESCE(SUM(CASE WHEN c.type_mouvement = 'entree' AND date(c.date_mouvement) = date(?) THEN c.nombre_casiers ELSE 0 END), 0) as entrees_jour,
        COALESCE(SUM(CASE WHEN c.type_mouvement = 'sortie' AND date(c.date_mouvement) = date(?) THEN c.nombre_casiers ELSE 0 END), 0) as sorties_jour,
        (
          COALESCE(SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END), 0)
        ) as stock_actuel
      FROM types_boissons t
      LEFT JOIN casiers c
        ON c.type_boisson = t.nom
        AND date(c.date_mouvement) <= date(?)
      WHERE t.actif = 1
      GROUP BY t.nom
      ORDER BY t.nom`,
      [dateStock, dateStock, dateStock]
    );
  } catch (error) {
    console.error('Erreur getStockParGout:', error);
    return [];
  }
};

export const getStatistiquesGoûts = async () => {
  try {
    const plusDemandes = await executeQuery(
      `SELECT type_boisson, SUM(nombre_casiers) as total_sorties
       FROM casiers
       WHERE type_mouvement = 'sortie'
       GROUP BY type_boisson
       ORDER BY total_sorties DESC
       LIMIT 10`
    );
    
    const moinsDemandes = await executeQuery(
      `SELECT type_boisson, SUM(nombre_casiers) as total_sorties
       FROM casiers
       WHERE type_mouvement = 'sortie'
       GROUP BY type_boisson
       ORDER BY total_sorties ASC
       LIMIT 10`
    );
    
    const rotationRapide = await executeQuery(
      `SELECT type_boisson, COUNT(*) as nb_mouvements, SUM(nombre_casiers) as total
       FROM casiers
       WHERE type_mouvement = 'sortie'
       AND date(date_mouvement) >= date('now', '-30 days')
       GROUP BY type_boisson
       ORDER BY nb_mouvements DESC
       LIMIT 10`
    );
    
    const rotationLente = await executeQuery(
      `SELECT type_boisson, COUNT(*) as nb_mouvements, SUM(nombre_casiers) as total
       FROM casiers
       WHERE type_mouvement = 'sortie'
       AND date(date_mouvement) >= date('now', '-30 days')
       GROUP BY type_boisson
       ORDER BY nb_mouvements ASC
       LIMIT 10`
    );
    
    return {
      plusDemandes,
      moinsDemandes,
      rotationRapide,
      rotationLente
    };
  } catch (error) {
    console.error('Erreur getStatistiquesGoûts:', error);
    return { plusDemandes: [], moinsDemandes: [], rotationRapide: [], rotationLente: [] };
  }
};

export const getDashboardStats = async () => {
  const totalClients = await executeQuery('SELECT COUNT(*) as count FROM clients');
  const casiersAujourdhui = await executeQuery(
    `SELECT 
      SUM(CASE WHEN type_mouvement = 'entree' THEN nombre_casiers ELSE 0 END) as entrees,
      SUM(CASE WHEN type_mouvement = 'sortie' THEN nombre_casiers ELSE 0 END) as sorties
      FROM casiers 
      WHERE date(date_mouvement) = date('now')`
  );
  const stockTotal = await executeQuery(
    `SELECT 
      SUM(CASE WHEN type_mouvement = 'entree' THEN nombre_casiers ELSE 0 END) as total_entrees,
      SUM(CASE WHEN type_mouvement = 'sortie' THEN nombre_casiers ELSE 0 END) as total_sorties
      FROM casiers`
  );
  const facturesImpayes = await executeQuery(
    `SELECT COUNT(*) as count, SUM(montant_total - montant_paye) as montant 
      FROM factures 
      WHERE statut = 'impayee' OR montant_paye < montant_total`
  );
  const revenuMois = await executeQuery(
    `SELECT SUM(montant_paye) as total 
      FROM factures 
      WHERE strftime('%Y-%m', date_facture) = strftime('%Y-%m', 'now')`
  );

  const stockData = stockTotal[0] || { total_entrees: 0, total_sorties: 0 };
  const stockRestant = (stockData.total_entrees || 0) - (stockData.total_sorties || 0);

  return {
    totalClients: totalClients[0] || { count: 0 },
    casiersAujourdhui: casiersAujourdhui[0] || { entrees: 0, sorties: 0 },
    stockRestant: stockRestant,
    stockTotal: stockData,
    facturesImpayes: facturesImpayes[0] || { count: 0, montant: 0 },
    revenuMois: revenuMois[0] || { total: 0 }
  };
};
