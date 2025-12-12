import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Portal, Modal, TextInput, Button, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRappels, getFacturesImpayes, addRappel } from '../services/database';
import { format } from 'date-fns';

export default function RappelsScreen() {
  const [rappels, setRappels] = useState([]);
  const [facturesImpayes, setFacturesImpayes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    type_rappel: 'email',
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rappelsResult = await getRappels();
      setRappels(rappelsResult || []);

      const impayesResult = await getFacturesImpayes();
      setFacturesImpayes(impayesResult || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openRappelModal = (facture) => {
    setSelectedFacture(facture);
    setFormData({
      type_rappel: 'email',
      message: `Bonjour ${facture.nom} ${facture.prenom},\n\nNous vous rappelons que votre facture d'un montant de ${facture.montant_restant.toLocaleString('fr-FR')} FCFA reste impayée.\n\nMerci de régulariser votre situation dans les plus brefs délais.\n\nCordialement,\nDépôt de Boissons`
    });
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedFacture || !formData.message) {
        console.error('Facture et message requis');
        return;
      }
      
      await addRappel({
        facture_id: selectedFacture.id,
        client_id: selectedFacture.client_id,
        type_rappel: formData.type_rappel,
        message: formData.message
      });
      setVisible(false);
      setSelectedFacture(null);
      setFormData({ type_rappel: 'email', message: '' });
      loadData();
      Alert.alert('Succès', 'Rappel enregistré avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi du rappel');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
            <Card.Content>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Factures Impayées</Text>
                  <Title style={[styles.statValue, { color: '#ef4444' }]}>{facturesImpayes.length}</Title>
                </View>
                <MaterialCommunityIcons name="alert-circle" size={40} color="#ef4444" />
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Card.Content>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Rappels Envoyés</Text>
                  <Title style={[styles.statValue, { color: '#3b82f6' }]}>{rappels.length}</Title>
                </View>
                <MaterialCommunityIcons name="bell-alert" size={40} color="#3b82f6" />
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Clients avec Factures Impayées</Title>
            {facturesImpayes.map((facture) => {
              try {
                return (
                  <Card key={facture.id} style={styles.factureCard}>
                    <Card.Content>
                      <View style={styles.factureHeader}>
                        <Text style={styles.clientName}>
                          {facture.nom} {facture.prenom}
                        </Text>
                      </View>
                      {facture.email && (
                        <Text style={styles.contact}>📧 {facture.email}</Text>
                      )}
                      {facture.telephone && (
                        <Text style={styles.contact}>📱 {facture.telephone}</Text>
                      )}
                      <Text style={styles.montantDu}>
                        Montant dû: <Text style={styles.montantValue}>
                          {facture.montant_restant ? facture.montant_restant.toLocaleString('fr-FR') : '0'} FCFA
                        </Text>
                      </Text>
                      <Text style={styles.date}>
                        Date facture: {facture.date_facture ? (() => {
                          try {
                            return format(new Date(facture.date_facture), 'dd/MM/yyyy');
                          } catch (e) {
                            return 'Date invalide';
                          }
                        })() : 'N/A'}
                      </Text>
                      <Button
                        mode="contained"
                        onPress={() => openRappelModal(facture)}
                        style={styles.rappelButton}
                        icon="send"
                      >
                        Envoyer Rappel
                      </Button>
                    </Card.Content>
                  </Card>
                );
              } catch (error) {
                console.error('Erreur affichage facture:', error);
                return null;
              }
            })}
            {facturesImpayes.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#10b981" />
                <Text style={styles.emptyText}>Aucune facture impayée</Text>
                <Text style={styles.emptySubtext}>Tous les clients sont à jour!</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Historique des Rappels</Title>
            {rappels.map((rappel) => (
              <Card key={rappel.id} style={styles.rappelCard}>
                <Card.Content>
                  <View style={styles.rappelHeader}>
                    <MaterialCommunityIcons name="bell-alert" size={20} color="#0ea5e9" />
                    <Text style={styles.rappelClient}>
                      {rappel.nom} {rappel.prenom}
                    </Text>
                  </View>
                  <Text style={styles.rappelDate}>
                    {(() => {
                      if (!rappel.date_rappel) return 'N/A';
                      try {
                        return format(new Date(rappel.date_rappel), 'dd/MM/yyyy HH:mm');
                      } catch (e) {
                        return 'Date invalide';
                      }
                    })()}
                  </Text>
                  <Chip
                    mode="flat"
                    style={styles.typeChip}
                  >
                    {rappel.type_rappel === 'email' ? '📧 Email' : 
                     rappel.type_rappel === 'sms' ? '📱 SMS' : '☎️ Téléphone'}
                  </Chip>
                  <Text style={styles.rappelMontant}>
                    Montant: {(rappel.montant_total - rappel.montant_paye).toLocaleString('fr-FR')} FCFA
                  </Text>
                  <Card style={styles.messageCard}>
                    <Card.Content>
                      <Text style={styles.message}>{rappel.message}</Text>
                    </Card.Content>
                  </Card>
                </Card.Content>
              </Card>
            ))}
            {rappels.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptySubtext}>Aucun rappel envoyé pour le moment.</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Envoyer un Rappel</Title>
          {selectedFacture && (
            <ScrollView>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text>Client: <Text style={styles.bold}>{selectedFacture.nom} {selectedFacture.prenom}</Text></Text>
                  <Text>Email: <Text style={styles.bold}>{selectedFacture.email || 'Non renseigné'}</Text></Text>
                  <Text>Téléphone: <Text style={styles.bold}>{selectedFacture.telephone || 'Non renseigné'}</Text></Text>
                  <Text>Montant dû: <Text style={[styles.bold, { color: '#ef4444' }]}>
                    {selectedFacture.montant_restant.toLocaleString('fr-FR')} FCFA
                  </Text></Text>
                </Card.Content>
              </Card>

              <Text style={styles.label}>Type de Rappel *</Text>
              <Picker
                selectedValue={formData.type_rappel}
                onValueChange={(value) => setFormData({ ...formData, type_rappel: value })}
                style={styles.picker}
              >
                <Picker.Item label="📧 Email" value="email" />
                <Picker.Item label="📱 SMS" value="sms" />
                <Picker.Item label="☎️ Téléphone" value="telephone" />
              </Picker>

              <TextInput
                label="Message *"
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                multiline
                numberOfLines={8}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleSubmit} style={styles.button} icon="send">
                  Envoyer
                </Button>
                <Button mode="outlined" onPress={() => setVisible(false)} style={styles.button}>
                  Annuler
                </Button>
              </View>
            </ScrollView>
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
  factureCard: {
    marginTop: 12,
    backgroundColor: '#fef3c7',
  },
  factureHeader: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  montantDu: {
    fontSize: 14,
    marginTop: 8,
  },
  montantValue: {
    fontWeight: 'bold',
    color: '#ef4444',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  rappelButton: {
    marginTop: 12,
  },
  rappelCard: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
  },
  rappelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rappelClient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rappelDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rappelMontant: {
    fontSize: 14,
    marginBottom: 8,
  },
  messageCard: {
    backgroundColor: '#f3f4f6',
    marginTop: 8,
  },
  message: {
    fontSize: 13,
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#fef3c7',
  },
  bold: {
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    marginTop: 8,
  },
  picker: {
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
});
