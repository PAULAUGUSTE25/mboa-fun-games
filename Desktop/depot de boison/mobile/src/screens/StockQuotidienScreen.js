import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Text, Button, DataTable, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sauvegarderStockQuotidien, getStockQuotidien, getHistoriqueStock } from '../services/database';
import { format } from 'date-fns';

export default function StockQuotidienScreen() {
  const [stockAujourdhui, setStockAujourdhui] = useState([]);
  const [stockHier, setStockHier] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const aujourdhui = format(new Date(), 'yyyy-MM-dd');
      const hier = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
      
      const stockToday = await getStockQuotidien(aujourdhui);
      const stockYesterday = await getStockQuotidien(hier);
      const hist = await getHistoriqueStock(null, 7);
      
      setStockAujourdhui(stockToday || []);
      setStockHier(stockYesterday || []);
      setHistorique(hist || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSauvegarder = async () => {
    setLoading(true);
    try {
      const success = await sauvegarderStockQuotidien();
      if (success) {
        Alert.alert('Succès', 'Stock quotidien sauvegardé avec succès !');
        loadData();
      } else {
        Alert.alert('Erreur', 'Erreur lors de la sauvegarde du stock');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="calendar-today" size={30} color="#0ea5e9" />
              <Title style={styles.title}>Stock d'Hier ({format(new Date(Date.now() - 86400000), 'dd/MM/yyyy')})</Title>
            </View>
            {stockHier.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Goût</DataTable.Title>
                  <DataTable.Title numeric>Début</DataTable.Title>
                  <DataTable.Title numeric>Entrées</DataTable.Title>
                  <DataTable.Title numeric>Sorties</DataTable.Title>
                  <DataTable.Title numeric>Fin</DataTable.Title>
                </DataTable.Header>
                {stockHier.map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.stock_debut}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ color: '#10b981' }}>{item.entrees}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ color: '#ef4444' }}>{item.sorties}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ fontWeight: 'bold' }}>{item.stock_fin}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.emptyText}>Aucun stock sauvegardé pour hier</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="content-save" size={30} color="#10b981" />
              <Title style={styles.title}>Sauvegarder le Stock d'Aujourd'hui</Title>
            </View>
            <Text style={styles.infoText}>
              Cliquez sur le bouton ci-dessous pour sauvegarder le stock de fin de journée.
              Cela permettra de garder un historique et de le rappeler demain.
            </Text>
            <Button
              mode="contained"
              onPress={handleSauvegarder}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              icon="content-save"
            >
              Sauvegarder le Stock du Jour
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="history" size={30} color="#f59e0b" />
              <Title style={styles.title}>Historique (7 derniers jours)</Title>
            </View>
            {historique.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Date</DataTable.Title>
                  <DataTable.Title>Goût</DataTable.Title>
                  <DataTable.Title numeric>Entrées</DataTable.Title>
                  <DataTable.Title numeric>Sorties</DataTable.Title>
                </DataTable.Header>
                {historique.slice(0, 20).map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{item.date_stock ? format(new Date(item.date_stock), 'dd/MM') : 'N/A'}</DataTable.Cell>
                    <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ color: '#10b981' }}>{item.entrees}</DataTable.Cell>
                    <DataTable.Cell numeric style={{ color: '#ef4444' }}>{item.sorties}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <Text style={styles.emptyText}>Aucun historique disponible</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#10b981',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 20,
    fontSize: 14,
  },
});
