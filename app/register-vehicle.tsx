import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../src/config/firebase';
import { registerVehicle } from '../src/services/vehicleService';

const VEHICLE_TYPES = [
  { id: 'Car', label: 'Car', emoji: '🚗' },
  { id: 'Bike', label: 'Bike', emoji: '🏍️' },
  { id: 'Bus', label: 'Bus', emoji: '🚌' },
  { id: 'Truck', label: 'Truck', emoji: '🚛' },
];

export default function RegisterVehicleScreen() {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Error', 'Please enter vehicle number');
      return;
    }
    if (!vehicleModel.trim()) {
      Alert.alert('Error', 'Please enter vehicle model');
      return;
    }
    if (!vehicleColor.trim()) {
      Alert.alert('Error', 'Please enter vehicle color');
      return;
    }

    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await registerVehicle(
        userId,
        vehicleNumber,
        vehicleType,
        vehicleModel,
        vehicleColor
      );
      setLoading(false);
      Alert.alert('Success', 'Vehicle Registered Successfully! ✅', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to register vehicle');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#007AFF', '#0055FF']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Register Vehicle</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="MH 12 AB 3456"
              placeholderTextColor="#666"
              value={vehicleNumber}
              onChangeText={(text) => setVehicleNumber(text.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeSelector}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeItem,
                    vehicleType === type.id ? styles.typeItemActive : null
                  ]}
                  onPress={() => setVehicleType(type.id)}
                >
                  <Text style={styles.typeEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.typeLabel,
                    vehicleType === type.id ? styles.typeLabelActive : null
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Honda City"
              placeholderTextColor="#666"
              value={vehicleModel}
              onChangeText={setVehicleModel}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Color</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. White"
              placeholderTextColor="#666"
              value={vehicleColor}
              onChangeText={setVehicleColor}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plate Preview</Text>
            <View style={styles.plateContainer}>
              <View style={styles.plate}>
                <View style={styles.plateLeft}>
                  <Text style={styles.plateIND}>IND</Text>
                  <View style={styles.plateChakra} />
                </View>
                <Text style={styles.plateNumber}>
                  {vehicleNumber || 'MH 12 AB 3456'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.registerButtonContainer}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.registerButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>Register Vehicle</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Your vehicle info is secure and never shared publicly
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerSafeArea: {
    paddingTop: 44,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeItem: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 4,
  },
  typeItemActive: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },
  typeLabelActive: {
    color: '#007AFF',
  },
  plateContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  plate: {
    backgroundColor: '#FFD700',
    width: '100%',
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  plateLeft: {
    alignItems: 'center',
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    paddingRight: 8,
  },
  plateIND: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000080',
  },
  plateChakra: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000080',
    marginTop: 2,
  },
  plateNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  registerButtonContainer: {
    marginTop: 20,
  },
  registerButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyNote: {
    alignItems: 'center',
    marginTop: 16,
  },
  privacyText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
});
