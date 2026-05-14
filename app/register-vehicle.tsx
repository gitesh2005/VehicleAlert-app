import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '@/src/config/firebase';
import { registerVehicle, getUserVehicleCount, searchVehicle } from '@/src/services/vehicleService';
import emailjs from '@emailjs/browser';

const VEHICLE_TYPES = [
  { id: 'Car', label: 'Car', emoji: '🚗' },
  { id: 'Bike', label: 'Bike', emoji: '🏍️' },
  { id: 'Bus', label: 'Bus', emoji: '🚌' },
  { id: 'Truck', label: 'Truck', emoji: '🚛' },
];

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterVehicleScreen() {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!auth().currentUser) {
      router.replace('/');
    }
  }, []);

  const [errors, setErrors] = useState({
    vehicleNumber: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleColor: '',
    email: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = {
      vehicleNumber: '',
      vehicleType: '',
      vehicleModel: '',
      vehicleColor: '',
      email: '',
    };

    const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();

    if (!cleanNumber) {
      newErrors.vehicleNumber = 'Vehicle number is required';
      isValid = false;
    } else if (!VEHICLE_REGEX.test(cleanNumber)) {
      newErrors.vehicleNumber = 'Please enter valid Indian vehicle number e.g. MH12AB3456';
      isValid = false;
    }

    if (!vehicleType) {
      newErrors.vehicleType = 'Please select a vehicle type';
      isValid = false;
    }

    if (!vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
      isValid = false;
    }

    if (!vehicleColor.trim()) {
      newErrors.vehicleColor = 'Vehicle color is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendVerificationEmail = async (targetEmail: string, otp: string) => {
    try {
      await emailjs.send(
        'service_lli7q7s',
        'template_anea56f',
        {
          to_email: targetEmail,
          'OTP Code': otp,
          'expiry time': new Date(Date.now() + 15 * 60000).toLocaleTimeString(),
        },
        'BrIyOvR1hu278KSJ-'
      );
      return true;
    } catch (error) {
      console.error('EmailJS Error:', error);
      return false;
    }
  };

  const handleRegisterInitiate = async () => {
    if (!validate()) return;

    const user = auth().currentUser;
    if (!user) {
      router.replace('/');
      return;
    }

    setLoading(true);
    try {
      const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();

      // 1. Check for duplicate registration
      const existingVehicle = await searchVehicle(cleanNumber);
      if (existingVehicle) {
        setLoading(false);
        if (existingVehicle.userId === user.uid) {
          Alert.alert('Already Registered', 'You have already registered this vehicle');
        } else {
          Alert.alert('Duplicate Vehicle', 'This vehicle is already registered on VehicleAlert');
        }
        return;
      }

      // 2. Check vehicle limit
      const vehicleCount = await getUserVehicleCount(user.uid);
      if (vehicleCount >= 3) {
        setLoading(false);
        Alert.alert('Limit Reached', 'Maximum 3 vehicles allowed per account');
        return;
      }

      // 3. Generate and Send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const success = await sendVerificationEmail(email, otp);

      if (success) {
        setGeneratedOtp(otp);
        setOtpExpiry(Date.now() + 15 * 60000); // 15 mins
        setLoading(false);
        setShowOtpModal(true);
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to send verification email. Please try again.');
      }

    } catch (error: any) {
      setLoading(false);
      console.error('Registration initiate error:', error);
      Alert.alert('Error', '❌ Something went wrong. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (userOtp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    if (Date.now() > (otpExpiry || 0)) {
      Alert.alert('OTP Expired', 'The OTP has expired. Please try again.');
      setShowOtpModal(false);
      return;
    }

    if (userOtp !== generatedOtp) {
      Alert.alert('Invalid OTP', 'The OTP entered is incorrect.');
      return;
    }

    setVerifying(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not found');

      const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
      
      await registerVehicle(
        user.uid,
        cleanNumber,
        vehicleType,
        vehicleModel,
        vehicleColor
      );
      
      setVerifying(false);
      setShowOtpModal(false);
      Alert.alert('Success', '✅ Vehicle Registered Successfully!');
      
      setTimeout(() => {
        router.push('/home');
      }, 1000);

    } catch (error) {
      setVerifying(false);
      console.error('Final registration error:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
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
              style={[styles.input, errors.vehicleNumber ? styles.inputError : null]}
              placeholder="MH 12 AB 3456"
              placeholderTextColor="#666"
              value={vehicleNumber}
              onChangeText={(text) => {
                setVehicleNumber(text.toUpperCase());
                if (errors.vehicleNumber) setErrors({ ...errors, vehicleNumber: '' });
              }}
              autoCapitalize="characters"
            />
            {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeSelector}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeItem,
                    vehicleType === type.id ? styles.typeItemActive : null,
                    errors.vehicleType ? styles.inputError : null
                  ]}
                  onPress={() => {
                    setVehicleType(type.id);
                    if (errors.vehicleType) setErrors({ ...errors, vehicleType: '' });
                  }}
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
            {errors.vehicleType ? <Text style={styles.errorText}>{errors.vehicleType}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={[styles.input, errors.vehicleModel ? styles.inputError : null]}
              placeholder="e.g. Honda City"
              placeholderTextColor="#666"
              value={vehicleModel}
              onChangeText={(text) => {
                setVehicleModel(text);
                if (errors.vehicleModel) setErrors({ ...errors, vehicleModel: '' });
              }}
            />
            {errors.vehicleModel ? <Text style={styles.errorText}>{errors.vehicleModel}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Color</Text>
            <TextInput
              style={[styles.input, errors.vehicleColor ? styles.inputError : null]}
              placeholder="e.g. White"
              placeholderTextColor="#666"
              value={vehicleColor}
              onChangeText={(text) => {
                setVehicleColor(text);
                if (errors.vehicleColor) setErrors({ ...errors, vehicleColor: '' });
              }}
            />
            {errors.vehicleColor ? <Text style={styles.errorText}>{errors.vehicleColor}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (for verification)</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="your-email@example.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
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
            onPress={handleRegisterInitiate}
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

      {/* OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Email 📧</Text>
            <Text style={styles.modalSubtitle}>
              We've sent a 6-digit OTP to{'\n'}
              <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>{email}</Text>
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#444"
              keyboardType="number-pad"
              maxLength={6}
              value={userOtp}
              onChangeText={setUserOtp}
            />

            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyOtp}
              disabled={verifying}
            >
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                style={styles.gradientButton}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Register ✓</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOtpModal(false)}
              disabled={verifying}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpInput: {
    backgroundColor: '#0D0F14',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 12,
  },
  gradientButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
