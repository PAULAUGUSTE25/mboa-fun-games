import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Linking } from 'react-native';
import { Card, Title, Text, FAB, Portal, Modal, TextInput, Button, Avatar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getClients, addClient, deleteClient } from '../services/database';

export default function ClientsScreen() {
  const [clients, setClients] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const result = await getClients();
      setClients(result || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nom || !formData.telephone) {
        Alert.alert('Erreur', 'Veuillez remplir le nom et le numéro WhatsApp');
        return;
      }
      
      // Valider le format du numéro (doit commencer par + ou être numérique)
      const phoneClean = formData.telephone.replace(/\s/g, '');
      if (!phoneClean.match(/^\+?[0-9]{8,15}$/)) {
        Alert.alert('Erreur', 'Numéro WhatsApp invalide. Format: +237XXXXXXXXX');
        return;
      }
      
      await addClient({
        nom: formData.nom,
        prenom: '', // Vide par défaut
        telephone: phoneClean,
        email: null,
        adresse: null
      });
      
      Alert.alert('Succès', 'Client ajouté avec succès');
      setVisible(false);
      setFormData({
        nom: '',
        telephone: ''
      });
      await loadClients();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'ajout du client');
    }
  };

  const handleDelete = async (clientId, clientNom) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${clientNom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(clientId);
              Alert.alert('Succès', 'Client supprimé');
              await loadClients();
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le client');
            }
          }
        }
      ]
    );
  };

  const envoyerWhatsApp = (client) => {
    try {
      if (!client.telephone) {
        Alert.alert('Erreur', 'Ce client n\'a pas de numéro WhatsApp');
        return;
      }
      
      // Nettoyer le numéro
      let phone = client.telephone.replace(/\s/g, '');
      if (!phone.startsWith('+')) {
        phone = '+237' + phone; // Ajouter le code pays Cameroun par défaut
      }
      
      // Message de rappel automatique
      const message = `Bonjour ${client.nom},\n\nCeci est un rappel concernant votre compte chez Dépôt de Boisson.\n\nMerci de nous contacter pour régulariser votre situation.\n\nCordialement,\nL'équipe Dépôt de Boisson`;
      
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur cet appareil');
          }
        })
        .catch((err) => {
          console.error('Erreur WhatsApp:', err);
          Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp');
        });
    } catch (error) {
      console.error('Erreur envoyerWhatsApp:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'ouverture de WhatsApp');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.grid}>
          {clients.map((client) => (
            <Card key={client.id} style={styles.clientCard}>
              <Card.Content>
                <View style={styles.clientHeader}>
                  <Avatar.Text 
                    size={50} 
                    label={(client.nom || 'C').charAt(0).toUpperCase()}
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                  <View style={styles.clientInfo}>
                    <Title style={styles.clientName}>{client.nom}</Title>
                    {client.telephone && (
                      <Text style={styles.clientDetail}>
                        <MaterialCommunityIcons name="whatsapp" size={16} color="#25D366" /> {client.telephone}
                      </Text>
                    )}
                  </View>
                  <View style={styles.clientActions}>
                    <IconButton
                      icon="whatsapp"
                      iconColor="#25D366"
                      size={24}
                      onPress={() => envoyerWhatsApp(client)}
                    />
                    <IconButton
                      icon="delete"
                      iconColor="#ef4444"
                      size={24}
                      onPress={() => handleDelete(client.id, client.nom)}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {clients.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun client enregistré</Text>
            <Text style={styles.emptySubtext}>Cliquez sur + pour ajouter un client</Text>
          </View>
        )}
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
          <Title>Nouveau Client</Title>
          <Text style={styles.helpText}>Ajoutez uniquement le nom et le numéro WhatsApp du client</Text>
          
          <TextInput
            label="Nom du Client *"
            value={formData.nom}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Jean Dupont"
          />
          
          <TextInput
            label="Numéro WhatsApp *"
            value={formData.telephone}
            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            placeholder="Ex: +237690000000"
            left={<TextInput.Icon icon="whatsapp" color="#25D366" />}
          />
          
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
              Ajouter Client
            </Button>
            <Button mode="outlined" onPress={() => setVisible(false)} style={styles.button}>
              Annuler
            </Button>
          </View>
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
  grid: {
    padding: 8,
  },
  clientCard: {
    marginBottom: 12,
    marginHorizontal: 8,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientInfo: {
    marginLeft: 16,
    flex: 1,
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 18,
    marginBottom: 8,
  },
  clientDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
});
