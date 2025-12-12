import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDashboardStats, initDatabase, initDefaultDrinkTypes } from '../services/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      console.log('Initialisation de la base de données...');
      await initDatabase();
      console.log('Initialisation des types de boissons...');
      await initDefaultDrinkTypes();
      console.log('Chargement des statistiques...');
      loadStats();
      
      // Rappeler le stock du jour précédent au démarrage
      await rappelerStockPrecedent();
    } catch (error) {
      console.error('Erreur initialisation DB:', error);
    }
  };

  const rappelerStockPrecedent = async () => {
    try {
      const { getStockQuotidien } = require('../services/database');
      const { format } = require('date-fns');
      
      const hier = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
      const stockHier = await getStockQuotidien(hier);
      
      if (stockHier && stockHier.length > 0) {
        console.log('Stock du jour précédent rappelé:', stockHier.length, 'produits');
      }
    } catch (error) {
      console.error('Erreur rappel stock:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.cardText}>
            <Paragraph style={styles.cardTitle}>{title}</Paragraph>
            <Title style={[styles.cardValue, { color }]}>{value}</Title>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          </View>
          <MaterialCommunityIcons name={icon} size={40} color={color} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Tableau de Bord</Title>
        <Text style={styles.headerDate}>
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </Text>
      </View>

      <StatCard
        title="Stock Restant de Casiers"
        value={stats?.stockRestant || 0}
        icon="package-variant"
        color="#0ea5e9"
        subtitle={`Total en stock`}
      />

      <StatCard
        title="Casiers Entrés Aujourd'hui"
        value={stats?.casiersAujourdhui?.entrees || 0}
        icon="arrow-up-circle"
        color="#10b981"
      />

      <StatCard
        title="Casiers Sortis Aujourd'hui"
        value={stats?.casiersAujourdhui?.sorties || 0}
        icon="arrow-down-circle"
        color="#f97316"
      />

      <StatCard
        title="Total Clients"
        value={stats?.totalClients?.count || 0}
        icon="account-group"
        color="#3b82f6"
      />

      <StatCard
        title="Factures Impayées"
        value={stats?.facturesImpayes?.count || 0}
        icon="alert-circle"
        color="#ef4444"
        subtitle={`${(stats?.facturesImpayes?.montant || 0).toLocaleString('fr-FR')} FCFA`}
      />

      <StatCard
        title="Revenu du Mois"
        value={`${(stats?.revenuMois?.total || 0).toLocaleString('fr-FR')} FCFA`}
        icon="cash"
        color="#8b5cf6"
      />

      <Card style={styles.card}>
        <Card.Content>
          <Title>Résumé des Mouvements</Title>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#10b981" />
              <Text style={styles.summaryLabel}>Total Entrées</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                {stats?.stockTotal?.total_entrees || 0}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#f97316" />
              <Text style={styles.summaryLabel}>Total Sorties</Text>
              <Text style={[styles.summaryValue, { color: '#f97316' }]}>
                {stats?.stockTotal?.total_sorties || 0}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="equal" size={20} color="#0ea5e9" />
              <Text style={styles.summaryLabel}>Stock Restant</Text>
              <Text style={[styles.summaryValue, { color: '#0ea5e9', fontWeight: 'bold' }]}>
                {stats?.stockRestant || 0}
              </Text>
            </View>
          </View>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerDate: {
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
