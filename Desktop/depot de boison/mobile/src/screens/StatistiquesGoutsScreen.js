import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, DataTable } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStatistiquesGoûts } from '../services/database';

export default function StatistiquesGoutsScreen() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStatistiquesGoûts();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="trending-up" size={30} color="#10b981" />
            <Title style={styles.title}>Goûts Les Plus Demandés</Title>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Goût</DataTable.Title>
              <DataTable.Title numeric>Total Sorties</DataTable.Title>
            </DataTable.Header>
            {stats?.plusDemandes.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                <DataTable.Cell numeric>{item.total_sorties}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="trending-down" size={30} color="#ef4444" />
            <Title style={styles.title}>Goûts Les Moins Demandés</Title>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Goût</DataTable.Title>
              <DataTable.Title numeric>Total Sorties</DataTable.Title>
            </DataTable.Header>
            {stats?.moinsDemandes.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                <DataTable.Cell numeric>{item.total_sorties}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="flash" size={30} color="#f59e0b" />
            <Title style={styles.title}>Rotation Rapide (30 jours)</Title>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Goût</DataTable.Title>
              <DataTable.Title numeric>Mouvements</DataTable.Title>
              <DataTable.Title numeric>Total</DataTable.Title>
            </DataTable.Header>
            {stats?.rotationRapide.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                <DataTable.Cell numeric>{item.nb_mouvements}</DataTable.Cell>
                <DataTable.Cell numeric>{item.total}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="snail" size={30} color="#6b7280" />
            <Title style={styles.title}>Rotation Lente (30 jours)</Title>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Goût</DataTable.Title>
              <DataTable.Title numeric>Mouvements</DataTable.Title>
              <DataTable.Title numeric>Total</DataTable.Title>
            </DataTable.Header>
            {stats?.rotationLente.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.type_boisson}</DataTable.Cell>
                <DataTable.Cell numeric>{item.nb_mouvements}</DataTable.Cell>
                <DataTable.Cell numeric>{item.total}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
  },
});
