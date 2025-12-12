import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, FAB, Portal, Modal, TextInput, Button, Chip, DataTable } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCasiers, addCasier, getClients, getTypesBoissons, deleteCasier, addFacture } from '../services/database';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function CasiersScreen() {
  const navigation = useNavigation();
  const [casiers, setCasiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [typesBoissons, setTypesBoissons] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    nom_client: '',
    type_boisson: '',
    nombre_casiers: '',
    type_mouvement: 'entree',
    prix_unitaire: '',
    notes: ''
  });
  const [selectedTypeInfo, setSelectedTypeInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    
    initData();
    
    // Cleanup pour éviter les fuites mémoire
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async () => {
    try {
      console.log('Début chargement des données...');
      
      // Charger les types de boissons (limité à 50 pour performance)
      const typesResult = await getTypesBoissons();
      const limitedTypes = typesResult ? typesResult.slice(0, 50) : [];
      console.log('Types chargés:', limitedTypes.length);
      setTypesBoissons(limitedTypes);
      
      // Charger seulement les casiers des 7 derniers jours (optimisation mémoire)
      const aujourdhui = format(new Date(), 'yyyy-MM-dd');
      const il7jours = format(new Date(Date.now() - 7 * 86400000), 'yyyy-MM-dd');
      const casiersResult = await getCasiers(il7jours, aujourdhui, null);
      const limitedCasiers = casiersResult ? casiersResult.slice(0, 100) : [];
      console.log('Casiers chargés:', limitedCasiers.length);
      setCasiers(limitedCasiers);
      
      setClients([]);
      
      console.log('Chargement terminé avec succès');
    } catch (error) {
      console.error('Erreur loadData:', error);
      // Réinitialiser avec des tableaux vides pour libérer la mémoire
      setCasiers([]);
      setClients([]);
      setTypesBoissons([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStockRestant = (typeBoisson) => {
    try {
      if (!casiers || !Array.isArray(casiers) || casiers.length === 0 || !typeBoisson) {
        return 0;
      }

      let entrees = 0;
      let sorties = 0;

      for (let i = 0; i < casiers.length; i++) {
        const c = casiers[i];
        if (!c || !c.type_boisson || !c.type_mouvement) continue;
        
        if (c.type_boisson === typeBoisson) {
          const nombre = parseInt(c.nombre_casiers) || 0;
          
          if (c.type_mouvement === 'entree') {
            entrees += nombre;
          } else if (c.type_mouvement === 'sortie') {
            sorties += nombre;
          }
        }
      }
      
      return entrees - sorties;
    } catch (error) {
      console.error('Erreur getStockRestant:', error);
      return 0;
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce mouvement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCasier(id);
              loadData();
              Alert.alert('Succès', 'Mouvement supprimé avec succès !');
            } catch (error) {
              console.error('Erreur:', error);
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    try {
      console.log('[CasiersScreen] handleSubmit - FormData:', formData);
      
      if (!formData.type_boisson || !formData.nombre_casiers) {
        Alert.alert('Erreur', 'Veuillez sélectionner un goût et entrer le nombre de casiers');
        return;
      }

      if (!formData.prix_unitaire || formData.prix_unitaire === '' || formData.prix_unitaire === '0') {
        Alert.alert('Erreur', 'Veuillez entrer un prix valide');
        return;
      }

      // Valider que le prix est un nombre valide
      const prixTest = parseFloat(formData.prix_unitaire);
      if (isNaN(prixTest) || prixTest <= 0) {
        Alert.alert('Erreur', 'Le prix doit être un nombre positif');
        return;
      }

      // Valider que le nombre de casiers est valide
      const nombreTest = parseInt(formData.nombre_casiers);
      if (isNaN(nombreTest) || nombreTest <= 0) {
        Alert.alert('Erreur', 'Le nombre de casiers doit être un nombre positif');
        return;
      }

      // Pour les sorties, le nom du client est OBLIGATOIRE
      if (formData.type_mouvement === 'sortie' && !formData.nom_client) {
        Alert.alert('Erreur', 'Veuillez entrer le nom du client pour une sortie');
        return;
      }
      
      console.log('[CasiersScreen] Validation OK, début enregistrement...');
      
      const montantUnitaire = parseFloat(formData.prix_unitaire);
      const nombreCasiers = parseInt(formData.nombre_casiers);
      const montantTotal = nombreCasiers * montantUnitaire;
      
      const casierData = {
        client_id: null,
        type_boisson: formData.type_boisson,
        nombre_casiers: nombreCasiers,
        type_mouvement: formData.type_mouvement,
        prix_unitaire: montantUnitaire,
        notes: formData.notes || '',
        facture_id: null
      };
      
      console.log('[CasiersScreen] Données à enregistrer:', casierData);
      
      await Promise.race([
        addCasier(casierData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      console.log('Enregistrement réussi');
      
      setVisible(false);
      const resetForm = {
        client_id: '',
        nom_client: '',
        type_boisson: '',
        nombre_casiers: '',
        type_mouvement: 'entree',
        prix_unitaire: '',
        notes: ''
      };
      setFormData(resetForm);
      setSelectedTypeInfo(null);
      
      await loadData();
      
      if (formData.type_mouvement === 'sortie') {
        // Rediriger vers Factures avec les données pré-remplies
        setTimeout(() => {
          navigation.navigate('Factures', {
            fromSortie: true,
            nom_client: formData.nom_client,
            montant: montantTotal,
            details: `${formData.nombre_casiers} casiers de ${formData.type_boisson}`
          });
        }, 100);
      } else {
        Alert.alert('Succès', 'Entrée enregistrée avec succès !');
      }
      
    } catch (error) {
      console.error('Erreur handleSubmit:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement: ' + error.message);
    }
  };

  const totalEntrees = casiers
    .filter(c => c.type_mouvement === 'entree')
    .reduce((sum, c) => sum + c.nombre_casiers, 0);

  const totalSorties = casiers
    .filter(c => c.type_mouvement === 'sortie')
    .reduce((sum, c) => sum + c.nombre_casiers, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <Card.Content>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Entrées</Text>
                  <Title style={[styles.statValue, { color: '#10b981' }]}>{totalEntrees}</Title>
                </View>
                <MaterialCommunityIcons name="arrow-up-circle" size={40} color="#10b981" />
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#fed7aa' }]}>
            <Card.Content>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Sorties</Text>
                  <Title style={[styles.statValue, { color: '#f97316' }]}>{totalSorties}</Title>
                </View>
                <MaterialCommunityIcons name="arrow-down-circle" size={40} color="#f97316" />
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Card.Content>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Solde</Text>
                  <Title style={[styles.statValue, { color: '#3b82f6' }]}>{totalEntrees - totalSorties}</Title>
                </View>
                <MaterialCommunityIcons name="calendar" size={40} color="#3b82f6" />
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Mouvements du Jour</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Boisson</DataTable.Title>
                <DataTable.Title numeric>Qté</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title>Action</DataTable.Title>
              </DataTable.Header>

              {casiers.map((casier) => (
                <DataTable.Row key={casier.id}>
                  <DataTable.Cell>{casier.type_boisson}</DataTable.Cell>
                  <DataTable.Cell numeric>{casier.nombre_casiers}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="flat"
                      style={{
                        backgroundColor: casier.type_mouvement === 'entree' ? '#d1fae5' : '#fed7aa'
                      }}
                      textStyle={{
                        color: casier.type_mouvement === 'entree' ? '#10b981' : '#f97316'
                      }}
                    >
                      {casier.type_mouvement === 'entree' ? 'Entrée' : 'Sortie'}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Button 
                      mode="text" 
                      icon="delete" 
                      textColor="#ef4444"
                      onPress={() => handleDelete(casier.id)}
                    >
                      Supprimer
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
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
          <ScrollView>
            <Title>Nouveau Mouvement</Title>

            <Text style={styles.label}>Goût de Boisson</Text>
            <Picker
              selectedValue={formData.type_boisson}
              onValueChange={(value) => {
                try {
                  console.log('[CasiersScreen] Sélection goût:', value);
                  const selectedType = typesBoissons.find(t => t && t.nom === value);
                  
                  setFormData({ 
                    ...formData, 
                    type_boisson: value || ''
                  });
                  setSelectedTypeInfo(selectedType || null);
                } catch (error) {
                  console.error('[CasiersScreen] Erreur sélection goût:', error);
                  Alert.alert('Erreur', 'Erreur lors de la sélection du goût');
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionner un goût" value="" />
              {typesBoissons.map(type => (
                <Picker.Item
                  key={type.id}
                  label={type.nom}
                  value={type.nom}
                />
              ))}
            </Picker>


            <TextInput
              label="Nombre de Casiers *"
              value={formData.nombre_casiers}
              onChangeText={(text) => setFormData({ ...formData, nombre_casiers: text })}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              placeholder="Entrez le nombre de casiers"
            />

            <Text style={styles.label}>Type de Mouvement</Text>
            <Picker
              selectedValue={formData.type_mouvement}
              onValueChange={(value) => {
                try {
                  console.log('[CasiersScreen] Changement type mouvement:', value);
                  setFormData({ 
                    ...formData, 
                    type_mouvement: value
                  });
                } catch (error) {
                  console.error('[CasiersScreen] Erreur changement type:', error);
                  setFormData({ ...formData, type_mouvement: value });
                }
              }}
              style={styles.picker}
            >
              <Picker.Item label="Entrée" value="entree" />
              <Picker.Item label="Sortie" value="sortie" />
            </Picker>

            {formData.type_mouvement === 'sortie' && (
              <TextInput
                label="Nom du Client * (obligatoire pour sortie)"
                value={formData.nom_client}
                onChangeText={(text) => setFormData({ ...formData, nom_client: text })}
                style={styles.input}
                mode="outlined"
                placeholder="Entrez le nom du client"
              />
            )}

            <TextInput
              label={formData.type_mouvement === 'entree' ? "Prix d'Achat par Casier (FCFA) *" : "Prix de Vente par Casier (FCFA) *"}
              value={formData.prix_unitaire}
              onChangeText={(text) => setFormData({ ...formData, prix_unitaire: text })}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              placeholder="Entrez le prix"
            />

            {formData.type_boisson && formData.nombre_casiers && formData.prix_unitaire && (() => {
              try {
                const nombre = parseInt(formData.nombre_casiers);
                const prix = parseFloat(formData.prix_unitaire);
                if (!isNaN(nombre) && !isNaN(prix) && nombre > 0 && prix > 0) {
                  return (
                    <Card style={styles.calculCard}>
                      <Card.Content>
                        <Text style={styles.calculLabel}>Montant Total:</Text>
                        <Text style={styles.calculValue}>
                          {(nombre * prix).toLocaleString('fr-FR')} FCFA
                        </Text>
                      </Card.Content>
                    </Card>
                  );
                }
                return null;
              } catch (error) {
                console.error('[CasiersScreen] Erreur calcul montant:', error);
                return null;
              }
            })()}

            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Enregistrer
              </Button>
              <Button mode="outlined" onPress={() => setVisible(false)} style={styles.button}>
                Annuler
              </Button>
            </View>
          </ScrollView>
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
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  card: {
    margin: 8,
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
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
  stockCard: {
    marginVertical: 12,
    backgroundColor: '#dbeafe',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockInfo: {
    marginLeft: 12,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  pendingText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
  },
  infoCard: {
    marginVertical: 8,
    backgroundColor: '#e0f2fe',
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
  },
  calculCard: {
    marginVertical: 12,
    backgroundColor: '#d1fae5',
  },
  calculLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  calculValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
