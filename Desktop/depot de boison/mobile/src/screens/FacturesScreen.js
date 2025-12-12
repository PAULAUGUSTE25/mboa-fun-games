import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, FAB, Portal, Modal, TextInput, Button, Chip, DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFactures, addFacture, updateFacture, getClients, deleteFacture } from '../services/database';
import { format } from 'date-fns';

export default function FacturesScreen({ route }) {
  console.log('[FacturesScreen] Initialisation du composant');
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [visible, setVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatut, setFilterStatut] = useState('all'); // 'all', 'payee', 'impayee', 'partielle'
  const [formData, setFormData] = useState({
    client_id: '',
    nom_manuel: '',
    montant_total: '',
    montant_paye: '0',
    statut: 'impayee',
    date_echeance: '',
    notes: '',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    jour: new Date().getDate(),
    heure: format(new Date(), 'HH:mm')
  });
  const [useManualName, setUseManualName] = useState(false);
  const [paymentData, setPaymentData] = useState({
    montant_paye: '',
    statut: 'payee'
  });

  useEffect(() => {
    console.log('[FacturesScreen] useEffect - Montage du composant');
    let isMounted = true;
    
    const initData = async () => {
      if (isMounted) {
        console.log('[FacturesScreen] initData - Chargement initial des données');
        await loadData();
      }
    };
    
    initData();
    
    // Cleanup pour éviter les fuites mémoire
    return () => {
      console.log('[FacturesScreen] useEffect - Démontage du composant (cleanup)');
      isMounted = false;
      // Libérer la mémoire
      setFactures([]);
      setClients([]);
    };
  }, []);

  // Gérer la redirection depuis une sortie
  useEffect(() => {
    if (route?.params?.fromSortie) {
      console.log('Redirection depuis sortie détectée');
      
      const montant = route.params.montant;
      const details = route.params.details;
      const nomClient = route.params.nom_client;
      
      if (montant && details && nomClient) {
        // Pré-remplir le montant, les notes ET le nom du client
        setFormData(prev => ({
          ...prev,
          montant_total: String(montant),
          notes: details,
          nom_manuel: nomClient
        }));
        
        // Activer le mode nom manuel
        setUseManualName(true);
        
        // Ouvrir le formulaire après un délai
        setTimeout(() => {
          setVisible(true);
        }, 800);
      }
    }
  }, [route?.params?.fromSortie]);


  const loadData = async () => {
    console.log('[FacturesScreen] loadData - Début du chargement des données');
    try {
      // Charger seulement les 50 dernières factures pour optimiser la mémoire
      console.log('[FacturesScreen] loadData - Appel getFactures()');
      const facturesResult = await getFactures(new Date().getFullYear(), null);
      const limitedFactures = facturesResult ? facturesResult.slice(0, 50) : [];
      console.log('[FacturesScreen] loadData - Factures reçues:', facturesResult?.length, 'Limitées à:', limitedFactures.length);
      setFactures(limitedFactures);

      // Charger seulement les clients actifs (limité à 100)
      console.log('[FacturesScreen] loadData - Appel getClients()');
      const clientsResult = await getClients();
      const limitedClients = clientsResult ? clientsResult.slice(0, 100) : [];
      console.log('[FacturesScreen] loadData - Clients reçus:', clientsResult?.length, 'Limités à:', limitedClients.length);
      setClients(limitedClients);
      
      console.log('[FacturesScreen] loadData - Chargement terminé avec succès - Factures:', limitedFactures.length, 'Clients:', limitedClients.length);
    } catch (error) {
      console.error('[FacturesScreen] loadData - ERREUR lors du chargement:', error);
      // Libérer la mémoire en cas d'erreur
      setFactures([]);
      setClients([]);
    }
  };

  const onRefresh = async () => {
    console.log('[FacturesScreen] onRefresh - Début du rafraîchissement');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    console.log('[FacturesScreen] onRefresh - Rafraîchissement terminé');
  };

  const handleSubmit = async () => {
    console.log('[FacturesScreen] handleSubmit - Début de la soumission');
    console.log('[FacturesScreen] handleSubmit - Données du formulaire:', formData);
    try {
      // Validation
      if ((!formData.client_id && !formData.nom_manuel) || !formData.montant_total) {
        console.error('[FacturesScreen] handleSubmit - VALIDATION ÉCHOUÉE: Client/Nom et montant requis');
        console.error('[FacturesScreen] handleSubmit - client_id:', formData.client_id, 'nom_manuel:', formData.nom_manuel, 'montant_total:', formData.montant_total);
        Alert.alert('Erreur', 'Veuillez renseigner le client et le montant');
        return;
      }
      
      console.log('[FacturesScreen] handleSubmit - Validation OK, préparation des données');
      const factureData = {
        ...formData,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        montant_total: parseFloat(formData.montant_total) || 0,
        montant_paye: parseFloat(formData.montant_paye) || 0,
        statut: formData.statut,
        annee: parseInt(formData.annee),
        mois: parseInt(formData.mois)
      };
      console.log('[FacturesScreen] handleSubmit - Données à enregistrer:', factureData);
      
      console.log('[FacturesScreen] handleSubmit - Appel addFacture()');
      await addFacture(factureData);
      console.log('[FacturesScreen] handleSubmit - Facture ajoutée avec succès');
      
      console.log('[FacturesScreen] handleSubmit - Fermeture du modal');
      setVisible(false);
     
      console.log('[FacturesScreen] handleSubmit - Réinitialisation du formulaire');
      setFormData({
        client_id: '',
        nom_manuel: '',
        montant_total: '',
        montant_paye: '0',
        statut: 'impayee',
        date_echeance: '',
        notes: '',
        annee: new Date().getFullYear(),
        mois: new Date().getMonth() + 1,
        jour: new Date().getDate(),
        heure: format(new Date(), 'HH:mm')
      });
      console.log('[FacturesScreen] handleSubmit - Facture créée et enregistrée');
      setUseManualName(false);
      
      console.log('[FacturesScreen] handleSubmit - Rechargement des données');
      await loadData();
      console.log('[FacturesScreen] handleSubmit - Processus terminé avec succès');
      Alert.alert('Succès', 'Facture créée avec succès !');
    } catch (error) {
      console.error('[FacturesScreen] handleSubmit - ERREUR lors de la création:', error);
      Alert.alert('Erreur', 'Erreur lors de la création de la facture');
    }
  };

  const handleDelete = async (id) => {
    console.log('[FacturesScreen] handleDelete - Demande de suppression facture ID:', id);
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette facture ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('[FacturesScreen] handleDelete - Suppression annulée')
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            console.log('[FacturesScreen] handleDelete - Confirmation de suppression pour ID:', id);
            try {
              console.log('[FacturesScreen] handleDelete - Appel deleteFacture()');
              await deleteFacture(id);
              console.log('[FacturesScreen] handleDelete - Facture supprimée, rechargement des données');
              await loadData();
              console.log('[FacturesScreen] handleDelete - Suppression terminée avec succès');
              Alert.alert('Succès', 'Facture supprimée avec succès !');
            } catch (error) {
              console.error('[FacturesScreen] handleDelete - ERREUR lors de la suppression:', error);
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    console.log('[FacturesScreen] handlePayment - Début enregistrement paiement');
    console.log('[FacturesScreen] handlePayment - Facture ID:', selectedFacture?.id);
    console.log('[FacturesScreen] handlePayment - Données paiement:', paymentData);
    try {
      console.log('[FacturesScreen] handlePayment - Appel updateFacture()');
      await updateFacture(
        selectedFacture.id,
        parseFloat(paymentData.montant_paye),
        paymentData.statut
      );
      console.log('[FacturesScreen] handlePayment - Paiement enregistré avec succès');
      setPaymentVisible(false);
      setSelectedFacture(null);
      setPaymentData({ montant_paye: '', statut: 'payee' });
      console.log('[FacturesScreen] handlePayment - Rechargement des données');
      await loadData();
      console.log('[FacturesScreen] handlePayment - Processus terminé');
      Alert.alert('Succès', 'Paiement enregistré avec succès !');
    } catch (error) {
      console.error('[FacturesScreen] handlePayment - ERREUR lors de l\'enregistrement:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du paiement');
    }
  };

  const openPaymentModal = (facture) => {
    console.log('[FacturesScreen] openPaymentModal - Ouverture modal paiement pour facture:', facture.id);
    console.log('[FacturesScreen] openPaymentModal - Détails facture:', facture);
    setSelectedFacture(facture);
    setPaymentData({
      montant_paye: facture.montant_paye?.toString() || '',
      statut: facture.statut
    });
    setPaymentVisible(true);
    console.log('[FacturesScreen] openPaymentModal - Modal ouvert');
  };

  // Filtrer les factures selon le statut sélectionné
  const facturesFiltrees = useMemo(() => {
    console.log('[FacturesScreen] Filtrage des factures - Filtre:', filterStatut);
    if (filterStatut === 'all') return factures;
    return factures.filter(f => f.statut === filterStatut);
  }, [factures, filterStatut]);

  // Utiliser useMemo pour éviter recalcul à chaque render
  const { totalFactures, totalPaye, totalImpaye } = useMemo(() => {
    console.log('[FacturesScreen] Calcul des totaux (useMemo)');
    const total = factures.reduce((sum, f) => sum + (f.montant_total || 0), 0);
    const paye = factures.reduce((sum, f) => sum + (f.montant_paye || 0), 0);
    const impaye = total - paye;
    console.log('[FacturesScreen] Totaux calculés - Total:', total, 'Payé:', paye, 'Impayé:', impaye);
    return { totalFactures: total, totalPaye: paye, totalImpaye: impaye };
  }, [factures]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Card.Content>
              <Text style={styles.statLabel}>Total Factures</Text>
              <Title style={[styles.statValue, { color: '#3b82f6' }]}>
                {totalFactures.toLocaleString('fr-FR')} FCFA
              </Title>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <Card.Content>
              <Text style={styles.statLabel}>Total Payé</Text>
              <Title style={[styles.statValue, { color: '#10b981' }]}>
                {totalPaye.toLocaleString('fr-FR')} FCFA
              </Title>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
            <Card.Content>
              <Text style={styles.statLabel}>Total Impayé</Text>
              <Title style={[styles.statValue, { color: '#ef4444' }]}>
                {totalImpaye.toLocaleString('fr-FR')} FCFA
              </Title>
            </Card.Content>
          </Card>
        </View>

        {/* Filtres par statut */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text style={styles.filterTitle}>Filtrer par statut :</Text>
            <View style={styles.filterContainer}>
              <Chip
                selected={filterStatut === 'all'}
                onPress={() => {
                  console.log('[FacturesScreen] Filtre changé: Toutes');
                  setFilterStatut('all');
                }}
                style={[styles.filterChip, filterStatut === 'all' && styles.filterChipActive]}
                textStyle={{ color: filterStatut === 'all' ? '#fff' : '#666' }}
              >
                Toutes ({factures.length})
              </Chip>
              <Chip
                selected={filterStatut === 'payee'}
                onPress={() => {
                  console.log('[FacturesScreen] Filtre changé: Payées');
                  setFilterStatut('payee');
                }}
                style={[styles.filterChip, filterStatut === 'payee' && { backgroundColor: '#10b981' }]}
                textStyle={{ color: filterStatut === 'payee' ? '#fff' : '#10b981' }}
              >
                Payées ({factures.filter(f => f.statut === 'payee').length})
              </Chip>
              <Chip
                selected={filterStatut === 'impayee'}
                onPress={() => {
                  console.log('[FacturesScreen] Filtre changé: Impayées');
                  setFilterStatut('impayee');
                }}
                style={[styles.filterChip, filterStatut === 'impayee' && { backgroundColor: '#ef4444' }]}
                textStyle={{ color: filterStatut === 'impayee' ? '#fff' : '#ef4444' }}
              >
                Impayées ({factures.filter(f => f.statut === 'impayee').length})
              </Chip>
              <Chip
                selected={filterStatut === 'partielle'}
                onPress={() => {
                  console.log('[FacturesScreen] Filtre changé: Partielles');
                  setFilterStatut('partielle');
                }}
                style={[styles.filterChip, filterStatut === 'partielle' && { backgroundColor: '#f59e0b' }]}
                textStyle={{ color: filterStatut === 'partielle' ? '#fff' : '#f59e0b' }}
              >
                Partielles ({factures.filter(f => f.statut === 'partielle').length})
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Liste des Factures {filterStatut !== 'all' && `(${facturesFiltrees.length})`}</Title>
            {facturesFiltrees && facturesFiltrees.length > 0 ? facturesFiltrees.map((facture) => (
              <Card key={facture.id} style={styles.factureCard}>
                <Card.Content>
                  <View style={styles.factureHeader}>
                    <Text style={styles.clientName}>
                      {(facture.client_nom && facture.client_prenom) 
                        ? `${facture.client_nom} ${facture.client_prenom}` 
                        : facture.nom_manuel || 'Client'}
                    </Text>
                    <Chip
                      mode="flat"
                      style={{
                        backgroundColor: facture.statut === 'payee' ? '#d1fae5' : 
                                       facture.statut === 'partielle' ? '#fef3c7' : '#fee2e2'
                      }}
                      textStyle={{
                        color: facture.statut === 'payee' ? '#10b981' : 
                               facture.statut === 'partielle' ? '#f59e0b' : '#ef4444'
                      }}
                    >
                      {facture.statut === 'payee' ? 'Payée' : 
                       facture.statut === 'partielle' ? 'Partielle' : 'Impayée'}
                    </Chip>
                  </View>
                  <Text style={styles.factureDate}>
                    📅 {(() => {
                      if (!facture.date_facture) return 'Date non disponible';
                      try {
                        return format(new Date(facture.date_facture), 'dd/MM/yyyy HH:mm');
                      } catch (e) {
                        return 'Date invalide';
                      }
                    })()}
                  </Text>
                  <View style={styles.factureAmounts}>
                    <Text>Total: <Text style={styles.bold}>{(facture.montant_total || 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                    <Text>Payé: <Text style={styles.bold}>{(facture.montant_paye || 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                    <Text>Reste: <Text style={[styles.bold, { color: '#ef4444' }]}>
                      {((facture.montant_total || 0) - (facture.montant_paye || 0)).toLocaleString('fr-FR')} FCFA
                    </Text></Text>
                  </View>
                  <View style={styles.buttonRow}>
                    <Button
                      mode="contained"
                      onPress={() => openPaymentModal(facture)}
                      style={styles.paymentButton}
                    >
                      Enregistrer Paiement
                    </Button>
                    <Button
                      mode="outlined"
                      icon="delete"
                      textColor="#ef4444"
                      onPress={() => handleDelete(facture.id)}
                      style={styles.deleteButton}
                    >
                      Supprimer
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )) : (
              <Text style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                {filterStatut === 'all' 
                  ? 'Aucune facture pour le moment'
                  : `Aucune facture ${filterStatut === 'payee' ? 'payée' : filterStatut === 'impayee' ? 'impayée' : 'partielle'}`
                }
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Nouvelle Facture</Title>
          <ScrollView>
            <View style={styles.switchContainer}>
              <Text>Sélectionner un client existant</Text>
              <Button 
                mode={useManualName ? "outlined" : "contained"}
                onPress={() => setUseManualName(false)}
                compact
              >
                Client
              </Button>
              <Button 
                mode={useManualName ? "contained" : "outlined"}
                onPress={() => setUseManualName(true)}
                compact
              >
                Nom Manuel
              </Button>
            </View>

            {!useManualName ? (
              <>
                <Text style={styles.label}>Client *</Text>
                <Picker
                  selectedValue={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner un client" value="" />
                  {clients && clients.length > 0 ? clients.map(client => (
                    <Picker.Item
                      key={client.id}
                      label={`${client.nom || ''} ${client.prenom || ''}`.trim() || 'Client sans nom'}
                      value={client.id}
                    />
                  )) : null}
                </Picker>
              </>
            ) : (
              <TextInput
                label="Nom du Client *"
                value={formData.nom_manuel}
                onChangeText={(text) => setFormData({ ...formData, nom_manuel: text })}
                style={styles.input}
                mode="outlined"
                placeholder="Entrez le nom du client"
              />
            )}

            <TextInput
              label="Montant Total (FCFA) *"
              value={formData.montant_total}
              onChangeText={(text) => setFormData({ ...formData, montant_total: text })}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <Text style={styles.label}>Statut de Paiement *</Text>
            <Picker
              selectedValue={formData.statut}
              onValueChange={(value) => {
                console.log('[FacturesScreen] Statut changé:', value);
                // Si payée, montant_payé = montant_total
                if (value === 'payee') {
                  setFormData({ 
                    ...formData, 
                    statut: value,
                    montant_paye: formData.montant_total || '0'
                  });
                } else {
                  setFormData({ 
                    ...formData, 
                    statut: value,
                    montant_paye: value === 'impayee' ? '0' : formData.montant_paye
                  });
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="🔴 Impayée" value="impayee" />
              <Picker.Item label="🟢 Payée" value="payee" />
              <Picker.Item label="🟡 Paiement Partiel" value="partielle" />
            </Picker>

            {formData.statut !== 'impayee' && (
              <TextInput
                label={formData.statut === 'payee' ? "Montant Payé (FCFA)" : "Montant Payé (FCFA) *"}
                value={formData.montant_paye}
                onChangeText={(text) => setFormData({ ...formData, montant_paye: text })}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                placeholder={formData.statut === 'payee' ? formData.montant_total : '0'}
              />
            )}

            <Card style={styles.dateCard}>
              <Card.Content>
                <Title style={styles.dateTitle}>Date et Heure (Auto-générée)</Title>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>📅 Date:</Text>
                  <Text style={styles.dateValue}>
                    {formData.jour}/{formData.mois}/{formData.annee}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>🕐 Heure:</Text>
                  <Text style={styles.dateValue}>{formData.heure}</Text>
                </View>
              </Card.Content>
            </Card>

            <TextInput
              label="Date d'échéance (optionnel)"
              value={formData.date_echeance}
              onChangeText={(text) => setFormData({ ...formData, date_echeance: text })}
              style={styles.input}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Créer
              </Button>
              <Button mode="outlined" onPress={() => setVisible(false)} style={styles.button}>
                Annuler
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          visible={paymentVisible}
          onDismiss={() => setPaymentVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Enregistrer un Paiement</Title>
          {selectedFacture && (
            <View>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text>Client: <Text style={styles.bold}>
                    {(selectedFacture.client_nom && selectedFacture.client_prenom) 
                      ? `${selectedFacture.client_nom} ${selectedFacture.client_prenom}` 
                      : selectedFacture.nom_manuel || 'Client'}
                  </Text></Text>
                  <Text>Montant Total: <Text style={styles.bold}>{(selectedFacture.montant_total || 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                  <Text>Déjà Payé: <Text style={styles.bold}>{(selectedFacture.montant_paye || 0).toLocaleString('fr-FR')} FCFA</Text></Text>
                  <Text>Reste: <Text style={[styles.bold, { color: '#ef4444' }]}>
                    {((selectedFacture.montant_total || 0) - (selectedFacture.montant_paye || 0)).toLocaleString('fr-FR')} FCFA
                  </Text></Text>
                </Card.Content>
              </Card>

              <TextInput
                label="Montant Payé (FCFA) *"
                value={paymentData.montant_paye}
                onChangeText={(text) => setPaymentData({ ...paymentData, montant_paye: text })}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <Text style={styles.label}>Statut *</Text>
              <Picker
                selectedValue={paymentData.statut}
                onValueChange={(value) => setPaymentData({ ...paymentData, statut: value })}
                style={styles.picker}
              >
                <Picker.Item label="Impayée" value="impayee" />
                <Picker.Item label="Partielle" value="partielle" />
                <Picker.Item label="Payée" value="payee" />
              </Picker>

              <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handlePayment} style={styles.button}>
                  Enregistrer
                </Button>
                <Button mode="outlined" onPress={() => setPaymentVisible(false)} style={styles.button}>
                  Annuler
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  statsContainer: {
    padding: 8,
  },
  statCard: {
    marginBottom: 8,
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 8,
  },
  filterCard: {
    margin: 8,
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  factureCard: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
  },
  factureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  factureDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  factureAmounts: {
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  paymentButton: {
    flex: 1,
    marginRight: 4,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 4,
    borderColor: '#ef4444',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0ea5e9',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  input: {
    marginBottom: 12,
  },
  picker: {
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    marginTop: 8,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#fef3c7',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  dateCard: {
    marginVertical: 16,
    backgroundColor: '#f0f9ff',
  },
  dateTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#0ea5e9',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
