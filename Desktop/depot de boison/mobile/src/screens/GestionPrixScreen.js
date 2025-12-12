import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Text, DataTable, FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTypesBoissons, executeQuery } from '../services/database';

export default function GestionPrixScreen() {
  const [typesBoissons, setTypesBoissons] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    prix_achat: '',
    prix_vente: ''
  });
  const [benefices, setBenefices] = useState(null);

  useEffect(() => {
    loadData();
    loadBenefices();
  }, []);

  const loadData = async () => {
    try {
      const types = await getTypesBoissons();
      setTypesBoissons(types || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadBenefices = async () => {
    try {
      // Calculer les bénéfices totaux
      const result = await executeQuery(`
        SELECT 
          c.type_boisson,
          SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END) as total_sorties,
          SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END) as total_entrees,
          t.prix_achat,
          t.prix_vente,
          (SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END) * t.prix_vente) as revenu_total,
          (SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END) * t.prix_achat) as cout_total,
          ((SUM(CASE WHEN c.type_mouvement = 'sortie' THEN c.nombre_casiers ELSE 0 END) * t.prix_vente) - 
           (SUM(CASE WHEN c.type_mouvement = 'entree' THEN c.nombre_casiers ELSE 0 END) * t.prix_achat)) as benefice
        FROM casiers c
        LEFT JOIN types_boissons t ON c.type_boisson = t.nom
        GROUP BY c.type_boisson
        ORDER BY benefice DESC
      `);
      setBenefices(result);
    } catch (error) {
      console.error('Erreur calcul bénéfices:', error);
    }
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setFormData({
      prix_achat: type.prix_achat.toString(),
      prix_vente: type.prix_vente.toString()
    });
    setVisible(true);
  };

  const handleUpdate = async () => {
    try {
      if (!formData.prix_achat || !formData.prix_vente) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs');
        return;
      }

      await executeQuery(
        'UPDATE types_boissons SET prix_achat = ?, prix_vente = ? WHERE id = ?',
        [parseFloat(formData.prix_achat), parseFloat(formData.prix_vente), selectedType.id]
      );

      setVisible(false);
      loadData();
      loadBenefices();
      Alert.alert('Succès', 'Prix mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Erreur lors de la mise à jour');
    }
  };

  const calculateMarge = (achat, vente) => {
    if (!achat || achat === 0) return 0;
    return (((vente - achat) / achat) * 100).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Gestion des Prix</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Goût</DataTable.Title>
                <DataTable.Title numeric>Achat</DataTable.Title>
                <DataTable.Title numeric>Vente</DataTable.Title>
                <DataTable.Title numeric>Marge %</DataTable.Title>
              </DataTable.Header>

              {typesBoissons.map((type) => (
                <DataTable.Row key={type.id} onPress={() => handleEdit(type)}>
                  <DataTable.Cell>{type.nom}</DataTable.Cell>
                  <DataTable.Cell numeric>{type.prix_achat}</DataTable.Cell>
                  <DataTable.Cell numeric>{type.prix_vente}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={{ color: calculateMarge(type.prix_achat, type.prix_vente) > 0 ? '#10b981' : '#ef4444' }}>
                      {calculateMarge(type.prix_achat, type.prix_vente)}%
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="cash-multiple" size={30} color="#10b981" />
              <Title style={styles.title}>Bénéfices par Goût</Title>
            </View>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Goût</DataTable.Title>
                <DataTable.Title numeric>Sorties</DataTable.Title>
                <DataTable.Title numeric>Bénéfice</DataTable.Title>
              </DataTable.Header>

              {benefices?.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                  <DataTable.Cell numeric>{item.total_sorties || 0}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={{ 
                      color: (item.benefice || 0) > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {(item.benefice || 0).toLocaleString('fr-FR')} F
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Bénéfice Total:</Text>
              <Text style={styles.totalValue}>
                {benefices?.reduce((sum, item) => sum + (item.benefice || 0), 0).toLocaleString('fr-FR')} FCFA
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Modifier les Prix</Title>
          {selectedType && (
            <>
              <Text style={styles.subtitle}>{selectedType.nom}</Text>
              
              <TextInput
                label="Prix d'Achat (FCFA)"
                value={formData.prix_achat}
                onChangeText={(text) => setFormData({ ...formData, prix_achat: text })}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Prix de Vente (FCFA)"
                value={formData.prix_vente}
                onChangeText={(text) => setFormData({ ...formData, prix_vente: text })}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              {formData.prix_achat && formData.prix_vente && (
                <Card style={styles.margeCard}>
                  <Card.Content>
                    <Text style={styles.margeText}>
                      Marge: <Text style={styles.margeValue}>
                        {calculateMarge(parseFloat(formData.prix_achat), parseFloat(formData.prix_vente))}%
                      </Text>
                    </Text>
                    <Text style={styles.margeText}>
                      Bénéfice par casier: <Text style={styles.margeValue}>
                        {(parseFloat(formData.prix_vente) - parseFloat(formData.prix_achat)).toLocaleString('fr-FR')} FCFA
                      </Text>
                    </Text>
                  </Card.Content>
                </Card>
              )}

              <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleUpdate} style={styles.button}>
                  Mettre à Jour
                </Button>
                <Button mode="outlined" onPress={() => setVisible(false)} style={styles.button}>
                  Annuler
                </Button>
              </View>
            </>
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
  card: {
    margin: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  margeCard: {
    marginVertical: 12,
    backgroundColor: '#d1fae5',
  },
  margeText: {
    fontSize: 14,
    marginVertical: 4,
  },
  margeValue: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
  totalContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
