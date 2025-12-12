import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getMonthlyStats } from '../services/database';

const screenWidth = Dimensions.get('window').width;

export default function StatistiquesScreen() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1
  });

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    try {
      const result = await getMonthlyStats(filters.annee, filters.mois);
      const data = result || [];

      const groupedData = {};
      data.forEach(item => {
        if (!groupedData[item.date]) {
          groupedData[item.date] = { date: item.date, entrees: 0, sorties: 0 };
        }
        if (item.type_mouvement === 'entree') {
          groupedData[item.date].entrees = item.total;
        } else if (item.type_mouvement === 'sortie') {
          groupedData[item.date].sorties = item.total;
        }
      });

      const chartData = Object.values(groupedData).map(item => {
        let jour = 0;
        try {
          const dateObj = new Date(item.date);
          if (!isNaN(dateObj.getTime())) {
            jour = dateObj.getDate();
          }
        } catch (e) {
          console.error('Invalid date:', item.date);
        }
        return {
          ...item,
          jour
        };
      }).sort((a, b) => a.jour - b.jour); // Sort by day to ensure chart is chronological

      setMonthlyData(chartData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const totalEntrees = monthlyData.reduce((sum, item) => sum + item.entrees, 0);
  const totalSorties = monthlyData.reduce((sum, item) => sum + item.sorties, 0);
  const solde = totalEntrees - totalSorties;

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#0ea5e9'
    }
  };

  const barChartData = {
    labels: monthlyData.slice(0, 10).map(item => item.jour.toString()),
    datasets: [
      {
        data: monthlyData.slice(0, 10).map(item => item.entrees),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
      {
        data: monthlyData.slice(0, 10).map(item => item.sorties),
        color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
      }
    ],
    legend: ['Entrées', 'Sorties']
  };

  const lineChartData = {
    labels: monthlyData.slice(0, 10).map(item => item.jour.toString()),
    datasets: [
      {
        data: monthlyData.slice(0, 10).map(item => item.entrees),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: monthlyData.slice(0, 10).map(item => item.sorties),
        color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Entrées', 'Sorties']
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title>Filtres</Title>
          <Text style={styles.label}>Année</Text>
          <Picker
            selectedValue={filters.annee}
            onValueChange={(value) => setFilters({ ...filters, annee: value })}
            style={styles.picker}
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>

          <Text style={styles.label}>Mois</Text>
          <Picker
            selectedValue={filters.mois}
            onValueChange={(value) => setFilters({ ...filters, mois: value })}
            style={styles.picker}
          >
            {moisNoms.map((nom, index) => (
              <Picker.Item key={index + 1} label={nom} value={index + 1} />
            ))}
          </Picker>
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Total Entrées</Text>
            <Title style={[styles.statValue, { color: '#10b981' }]}>{totalEntrees}</Title>
            <Text style={styles.statUnit}>casiers</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#fed7aa' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Total Sorties</Text>
            <Title style={[styles.statValue, { color: '#f97316' }]}>{totalSorties}</Title>
            <Text style={styles.statUnit}>casiers</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Solde</Text>
            <Title style={[styles.statValue, { color: '#3b82f6' }]}>{solde}</Title>
            <Text style={styles.statUnit}>casiers</Text>
          </Card.Content>
        </Card>
      </View>

      {monthlyData.length > 0 && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Graphique en Barres</Title>
              <Text style={styles.subtitle}>
                {moisNoms[filters.mois - 1]} {filters.annee}
              </Text>
              <BarChart
                data={barChartData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Évolution Journalière</Title>
              <Text style={styles.subtitle}>
                {moisNoms[filters.mois - 1]} {filters.annee}
              </Text>
              <LineChart
                data={lineChartData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Résumé Mensuel</Title>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.headerCell]}>Jour</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Entrées</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Sorties</Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Solde</Text>
                </View>
                {monthlyData.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.jour}</Text>
                    <Text style={[styles.tableCell, { color: '#10b981' }]}>{item.entrees}</Text>
                    <Text style={[styles.tableCell, { color: '#f97316' }]}>{item.sorties}</Text>
                    <Text style={[styles.tableCell, { color: '#3b82f6' }]}>{item.entrees - item.sorties}</Text>
                  </View>
                ))}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={[styles.tableCell, styles.bold]}>TOTAL</Text>
                  <Text style={[styles.tableCell, styles.bold, { color: '#10b981' }]}>{totalEntrees}</Text>
                  <Text style={[styles.tableCell, styles.bold, { color: '#f97316' }]}>{totalSorties}</Text>
                  <Text style={[styles.tableCell, styles.bold, { color: '#3b82f6' }]}>{solde}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {monthlyData.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Aucune donnée disponible pour cette période</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
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
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  table: {
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalRow: {
    backgroundColor: '#f3f4f6',
    marginTop: 4,
    borderRadius: 4,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#374151',
  },
  bold: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 20,
  },
});
