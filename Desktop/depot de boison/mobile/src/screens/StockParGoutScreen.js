import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, DataTable, Searchbar } from 'react-native-paper';
import { getStockParGout } from '../services/database';

export default function StockParGoutScreen() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stocks.filter(stock =>
        stock.type_boisson.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchQuery, stocks]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await getStockParGout();
      setStocks(data);
      setFilteredStocks(data);
    } catch (error) {
      console.error('Erreur chargement stocks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStocks();
  };

  const calculateTotals = () => {
    return filteredStocks.reduce(
      (acc, stock) => ({
        entrees: acc.entrees + (stock.total_entrees || 0),
        sorties: acc.sorties + (stock.total_sorties || 0),
        stock: acc.stock + (stock.stock_actuel || 0)
      }),
      { entrees: 0, sorties: 0, stock: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un goût..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Résumé Global</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Entrées</Text>
              <Text style={[styles.summaryValue, styles.entreesText]}>{totals.entrees}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Sorties</Text>
              <Text style={[styles.summaryValue, styles.sortiesText]}>{totals.sorties}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Stock Total</Text>
              <Text style={[styles.summaryValue, styles.stockText]}>{totals.stock}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.typeColumn}>Type Boisson</DataTable.Title>
              <DataTable.Title numeric style={styles.numberColumn}>Entrées</DataTable.Title>
              <DataTable.Title numeric style={styles.numberColumn}>Sorties</DataTable.Title>
              <DataTable.Title numeric style={styles.numberColumn}>Stock</DataTable.Title>
            </DataTable.Header>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text>Chargement...</Text>
              </View>
            ) : filteredStocks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune donnée disponible'}
                </Text>
              </View>
            ) : (
              filteredStocks.map((stock, index) => (
                <DataTable.Row key={index} style={styles.dataRow}>
                  <DataTable.Cell style={styles.typeColumn}>
                    <Text style={styles.typeText}>{stock.type_boisson}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn}>
                    <Text style={styles.entreesText}>{stock.total_entrees || 0}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn}>
                    <Text style={styles.sortiesText}>{stock.total_sorties || 0}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn}>
                    <Text style={[
                      styles.stockText,
                      stock.stock_actuel < 0 && styles.negativeStock
                    ]}>
                      {stock.stock_actuel || 0}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            )}
          </DataTable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchbar: {
    margin: 16,
    elevation: 2
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollView: {
    flex: 1
  },
  tableCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2
  },
  typeColumn: {
    flex: 2
  },
  numberColumn: {
    flex: 1
  },
  dataRow: {
    minHeight: 48
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500'
  },
  entreesText: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  sortiesText: {
    color: '#FF9800',
    fontWeight: 'bold'
  },
  stockText: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  negativeStock: {
    color: '#F44336'
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});
