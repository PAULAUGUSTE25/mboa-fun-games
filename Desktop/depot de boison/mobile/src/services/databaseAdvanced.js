import { executeQuery, initDB } from './database';
import { format } from 'date-fns';

// ============================================
// FONCTIONS AVANCÉES - AUDIT & TRAÇABILITÉ
// ============================================

/**
 * Enregistre une action dans le journal d'audit
 */
export const logAudit = async (tableName, recordId, action, oldValues = null, newValues = null, utilisateur = 'system') => {
  try {
    console.log(`[Audit] ${action} sur ${tableName} #${recordId}`);
    const database = await initDB();
    await database.runAsync(
      `INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, utilisateur)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tableName,
        recordId,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        utilisateur
      ]
    );
  } catch (error) {
    console.error('[Audit] Erreur logAudit:', error);
  }
};

/**
 * Récupère l'historique d'audit pour un enregistrement
 */
export const getAuditHistory = async (tableName, recordId) => {
  try {
    return await executeQuery(
      `SELECT * FROM audit_log 
       WHERE table_name = ? AND record_id = ?
       ORDER BY date_action DESC`,
      [tableName, recordId]
    );
  } catch (error) {
    console.error('[Audit] Erreur getAuditHistory:', error);
    return [];
  }
};

// ============================================
// FONCTIONS AVANCÉES - PAIEMENTS
// ============================================

/**
 * Enregistre un paiement et met à jour la facture
 */
export const enregistrerPaiement = async (factureId, montant, modePaiement, reference = null, notes = null) => {
  try {
    console.log(`[Paiement] Enregistrement paiement ${montant} FCFA pour facture #${factureId}`);
    const database = await initDB();
    
    // Récupérer la facture actuelle
    const factures = await executeQuery('SELECT * FROM factures WHERE id = ?', [factureId]);
    if (!factures || factures.length === 0) {
      throw new Error('Facture introuvable');
    }
    
    const facture = factures[0];
    const nouveauMontantPaye = (facture.montant_paye || 0) + montant;
    
    // Vérifier que le paiement ne dépasse pas le total
    if (nouveauMontantPaye > facture.montant_total) {
      throw new Error('Le montant payé dépasse le montant total de la facture');
    }
    
    // Déterminer le nouveau statut
    let nouveauStatut;
    if (nouveauMontantPaye >= facture.montant_total) {
      nouveauStatut = 'payee';
    } else if (nouveauMontantPaye > 0) {
      nouveauStatut = 'partielle';
    } else {
      nouveauStatut = 'impayee';
    }
    
    // Enregistrer le paiement
    const result = await database.runAsync(
      `INSERT INTO paiements (facture_id, montant, mode_paiement, reference_paiement, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [factureId, montant, modePaiement, reference, notes]
    );
    
    // Mettre à jour la facture
    await database.runAsync(
      `UPDATE factures 
       SET montant_paye = ?, 
           statut = ?,
           date_paiement = CASE WHEN ? = 'payee' THEN CURRENT_TIMESTAMP ELSE date_paiement END,
           mode_paiement = ?,
           date_modification = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nouveauMontantPaye, nouveauStatut, nouveauStatut, modePaiement, factureId]
    );
    
    // Audit
    await logAudit('paiements', result.lastInsertRowId, 'INSERT', null, { factureId, montant, modePaiement });
    await logAudit('factures', factureId, 'UPDATE', facture, { montant_paye: nouveauMontantPaye, statut: nouveauStatut });
    
    console.log(`[Paiement] Paiement enregistré avec succès. Nouveau statut: ${nouveauStatut}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[Paiement] Erreur enregistrerPaiement:', error);
    throw error;
  }
};

/**
 * Récupère l'historique des paiements d'une facture
 */
export const getHistoriquePaiements = async (factureId) => {
  try {
    return await executeQuery(
      `SELECT * FROM paiements 
       WHERE facture_id = ?
       ORDER BY date_paiement DESC`,
      [factureId]
    );
  } catch (error) {
    console.error('[Paiement] Erreur getHistoriquePaiements:', error);
    return [];
  }
};

// ============================================
// FONCTIONS AVANCÉES - STATISTIQUES
// ============================================

/**
 * Statistiques avancées du tableau de bord
 */
export const getStatistiquesAvancees = async () => {
  try {
    console.log('[Stats] Calcul des statistiques avancées...');
    
    // Chiffre d'affaires du mois
    const caResult = await executeQuery(
      `SELECT COALESCE(SUM(montant_total), 0) as ca_mois
       FROM factures
       WHERE strftime('%Y-%m', date_facture) = strftime('%Y-%m', 'now')`
    );
    
    // Bénéfices du mois
    const beneficesResult = await executeQuery(
      `SELECT 
        COALESCE(SUM(c.nombre_casiers * (c.prix_unitaire - COALESCE(tb.prix_achat, 0))), 0) as benefice_mois
       FROM casiers c
       LEFT JOIN types_boissons tb ON c.type_boisson = tb.nom
       WHERE c.type_mouvement = 'sortie' 
       AND strftime('%Y-%m', c.date_mouvement) = strftime('%Y-%m', 'now')`
    );
    
    // Créances (factures impayées)
    const creancesResult = await executeQuery(
      `SELECT COALESCE(SUM(montant_total - montant_paye), 0) as creances
       FROM factures
       WHERE statut IN ('impayee', 'partielle')`
    );
    
    // Factures en retard
    const retardResult = await executeQuery(
      `SELECT COUNT(*) as nb_retard, COALESCE(SUM(montant_total - montant_paye), 0) as montant_retard
       FROM factures
       WHERE statut IN ('impayee', 'partielle')
       AND date_echeance < date('now')`
    );
    
    // Top 5 clients
    const topClients = await executeQuery(
      `SELECT 
        c.id,
        c.nom,
        c.prenom,
        COUNT(f.id) as nb_factures,
        COALESCE(SUM(f.montant_total), 0) as total_achats
       FROM clients c
       LEFT JOIN factures f ON c.id = f.client_id
       WHERE c.actif = 1
       GROUP BY c.id
       ORDER BY total_achats DESC
       LIMIT 5`
    );
    
    // Produits les plus vendus
    const topProduits = await executeQuery(
      `SELECT 
        type_boisson,
        SUM(nombre_casiers) as total_vendus,
        COUNT(*) as nb_ventes
       FROM casiers
       WHERE type_mouvement = 'sortie'
       AND strftime('%Y-%m', date_mouvement) = strftime('%Y-%m', 'now')
       GROUP BY type_boisson
       ORDER BY total_vendus DESC
       LIMIT 5`
    );
    
    // Alertes stock
    const alertesStock = await executeQuery(
      `SELECT 
        sq.type_boisson,
        sq.stock_fin,
        tb.stock_minimum,
        tb.stock_maximum
       FROM stock_quotidien sq
       LEFT JOIN types_boissons tb ON sq.type_boisson = tb.nom
       WHERE sq.date_stock = date('now')
       AND (sq.stock_fin <= tb.stock_minimum OR sq.stock_fin >= tb.stock_maximum)`
    );
    
    console.log('[Stats] Statistiques calculées avec succès');
    
    return {
      ca_mois: caResult[0]?.ca_mois || 0,
      benefice_mois: beneficesResult[0]?.benefice_mois || 0,
      creances: creancesResult[0]?.creances || 0,
      factures_retard: {
        nombre: retardResult[0]?.nb_retard || 0,
        montant: retardResult[0]?.montant_retard || 0
      },
      top_clients: topClients,
      top_produits: topProduits,
      alertes_stock: alertesStock
    };
  } catch (error) {
    console.error('[Stats] Erreur getStatistiquesAvancees:', error);
    return null;
  }
};

/**
 * Analyse de rentabilité par produit
 */
export const analyseRentabilite = async (periode = 30) => {
  try {
    const dateDebut = format(new Date(Date.now() - periode * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    return await executeQuery(
      `SELECT 
        c.type_boisson,
        tb.prix_achat,
        tb.prix_vente,
        SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END) as total_achats,
        SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END) as total_ventes,
        SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END) as cout_total,
        SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END) as revenu_total,
        (SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END) - 
         SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END)) as benefice,
        ROUND((SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END) - 
               SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END)) * 100.0 /
              NULLIF(SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers * c.prix_unitaire ELSE 0 END), 0), 2) as marge_pct
       FROM casiers c
       LEFT JOIN types_boissons tb ON c.type_boisson = tb.nom
       WHERE c.date_mouvement >= date(?)
       GROUP BY c.type_boisson
       ORDER BY benefice DESC`,
      [dateDebut]
    );
  } catch (error) {
    console.error('[Stats] Erreur analyseRentabilite:', error);
    return [];
  }
};

// ============================================
// FONCTIONS AVANCÉES - GESTION CRÉDIT CLIENT
// ============================================

/**
 * Vérifie si un client peut acheter à crédit
 */
export const verifierCreditClient = async (clientId, montant) => {
  try {
    const clients = await executeQuery('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (!clients || clients.length === 0) {
      return { autorise: false, raison: 'Client introuvable' };
    }
    
    const client = clients[0];
    const creditDisponible = (client.limite_credit || 0) - (client.credit_utilise || 0);
    
    if (montant > creditDisponible) {
      return {
        autorise: false,
        raison: `Crédit insuffisant. Disponible: ${creditDisponible} FCFA`,
        credit_disponible: creditDisponible,
        limite_credit: client.limite_credit
      };
    }
    
    return {
      autorise: true,
      credit_disponible: creditDisponible,
      limite_credit: client.limite_credit
    };
  } catch (error) {
    console.error('[Crédit] Erreur verifierCreditClient:', error);
    return { autorise: false, raison: 'Erreur système' };
  }
};

/**
 * Met à jour le crédit utilisé d'un client
 */
export const mettreAJourCreditClient = async (clientId) => {
  try {
    const database = await initDB();
    
    // Calculer le crédit utilisé (factures impayées + partielles)
    const result = await executeQuery(
      `SELECT COALESCE(SUM(montant_total - montant_paye), 0) as credit_utilise
       FROM factures
       WHERE client_id = ? AND statut IN ('impayee', 'partielle')`,
      [clientId]
    );
    
    const creditUtilise = result[0]?.credit_utilise || 0;
    
    await database.runAsync(
      `UPDATE clients 
       SET credit_utilise = ?,
           date_modification = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [creditUtilise, clientId]
    );
    
    console.log(`[Crédit] Crédit client #${clientId} mis à jour: ${creditUtilise} FCFA`);
    return creditUtilise;
  } catch (error) {
    console.error('[Crédit] Erreur mettreAJourCreditClient:', error);
    throw error;
  }
};

// ============================================
// FONCTIONS AVANCÉES - GÉNÉRATION NUMÉROS
// ============================================

/**
 * Génère un numéro de facture unique
 */
export const genererNumeroFacture = async () => {
  try {
    const annee = new Date().getFullYear();
    const mois = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Compter les factures du mois
    const result = await executeQuery(
      `SELECT COUNT(*) as count FROM factures 
       WHERE strftime('%Y-%m', date_facture) = ?`,
      [`${annee}-${mois}`]
    );
    
    const numero = String((result[0]?.count || 0) + 1).padStart(4, '0');
    return `FAC-${annee}${mois}-${numero}`;
  } catch (error) {
    console.error('[Numéro] Erreur genererNumeroFacture:', error);
    return `FAC-${Date.now()}`;
  }
};

/**
 * Génère une référence unique pour un mouvement
 */
export const genererReferenceMouvement = async (typeMouvement) => {
  try {
    const date = format(new Date(), 'yyyyMMdd');
    const prefix = typeMouvement === 'entree' ? 'ENT' : 'SOR';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${date}-${random}`;
  } catch (error) {
    console.error('[Référence] Erreur genererReferenceMouvement:', error);
    return `${typeMouvement.toUpperCase()}-${Date.now()}`;
  }
};

// ============================================
// FONCTIONS AVANCÉES - PARAMÈTRES SYSTÈME
// ============================================

/**
 * Récupère un paramètre système
 */
export const getParametre = async (cle, valeurParDefaut = null) => {
  try {
    const result = await executeQuery('SELECT valeur FROM parametres WHERE cle = ?', [cle]);
    return result[0]?.valeur || valeurParDefaut;
  } catch (error) {
    console.error('[Paramètre] Erreur getParametre:', error);
    return valeurParDefaut;
  }
};

/**
 * Définit un paramètre système
 */
export const setParametre = async (cle, valeur, description = null) => {
  try {
    const database = await initDB();
    await database.runAsync(
      `INSERT OR REPLACE INTO parametres (cle, valeur, description, date_modification)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [cle, valeur, description]
    );
    console.log(`[Paramètre] ${cle} = ${valeur}`);
  } catch (error) {
    console.error('[Paramètre] Erreur setParametre:', error);
    throw error;
  }
};

// ============================================
// FONCTIONS AVANCÉES - NETTOYAGE & MAINTENANCE
// ============================================

/**
 * Nettoie les anciennes données d'audit (> 90 jours)
 */
export const nettoyerAudit = async (joursConservation = 90) => {
  try {
    const database = await initDB();
    const dateLimit = format(new Date(Date.now() - joursConservation * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    const result = await database.runAsync(
      'DELETE FROM audit_log WHERE date_action < date(?)',
      [dateLimit]
    );
    
    console.log(`[Maintenance] ${result.changes} entrées d'audit supprimées`);
    return result.changes;
  } catch (error) {
    console.error('[Maintenance] Erreur nettoyerAudit:', error);
    return 0;
  }
};

/**
 * Optimise la base de données (VACUUM)
 */
export const optimiserDatabase = async () => {
  try {
    console.log('[Maintenance] Optimisation de la base de données...');
    const database = await initDB();
    await database.execAsync('VACUUM;');
    await database.execAsync('ANALYZE;');
    console.log('[Maintenance] Optimisation terminée');
    return true;
  } catch (error) {
    console.error('[Maintenance] Erreur optimiserDatabase:', error);
    return false;
  }
};

/**
 * Exporte les données en JSON
 */
export const exporterDonnees = async () => {
  try {
    console.log('[Export] Exportation des données...');
    
    const clients = await executeQuery('SELECT * FROM clients');
    const factures = await executeQuery('SELECT * FROM factures');
    const casiers = await executeQuery('SELECT * FROM casiers');
    const typesBoissons = await executeQuery('SELECT * FROM types_boissons');
    
    const exportData = {
      version: '1.0',
      date_export: new Date().toISOString(),
      data: {
        clients,
        factures,
        casiers,
        types_boissons: typesBoissons
      }
    };
    
    console.log('[Export] Exportation terminée');
    return exportData;
  } catch (error) {
    console.error('[Export] Erreur exporterDonnees:', error);
    return null;
  }
};
