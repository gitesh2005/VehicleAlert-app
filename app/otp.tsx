import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db, getConfirmationResult } from '@/src/config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumberFromParams = params.phone as string;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [timer, setTimer] = useState(42);

  // Dot animations
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');

    if (code.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const confirmation = getConfirmationResult();
      if (!confirmation) {
        console.error('OTP Error: No confirmation result found');
        throw new Error('Verification session expired. Please go back and try again.');
      }

      console.log('Verifying OTP code...');
      const userCredential = await confirmation.confirm(code);
      const user = userCredential.user;
      console.log('OTP Verified successfully, user:', user?.uid);

      if (user) {
        // Save user to Firestore - wrap in a separate try/catch to prevent blocking navigation
        try {
          console.log('Saving user to Firestore...');
          const userRef = db.collection('users').doc(user.uid);
          
          // Use a shorter timeout for the document check if possible, or just set it
          await userRef.set({
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            lastLogin: firestore.FieldValue.serverTimestamp(),
            authProvider: 'phone',
          }, { merge: true });
          
          console.log('User data synced to Firestore');
        } catch (fsError) {
          console.error('Firestore Error (Non-blocking):', fsError);
          // We don't throw here so the user can still get into the app
        }
      }

      setLoading(false);
      console.log('✅ OTP Verification Success, navigating to welcome');
      router.push('/welcome');
    } catch (err: any) {
      setLoading(false);
      console.error('OTP Error:', err);
      
      if (err.code === 'auth/invalid-verification-code') {
        Alert.alert(
          'Invalid OTP',
          'The verification code you entered is incorrect. Please check and try again.',
          [{ text: 'OK', onPress: () => setOtp(['', '', '', '', '', '']) }]
        );
        inputRefs.current[0]?.focus();
      } else if (err.code === 'auth/session-expired') {
        Alert.alert(
          'Session Expired',
          'The verification session has expired. Please request a new OTP.',
          [{ text: 'Go Back', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Verification Failed', err.message || 'The OTP entered is incorrect.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.header}>
          <LinearGradient
            colors={['#0D2B2B', '#0D3D3D', '#0A1A2A']}
            style={styles.iconCircle}
          >
            <Text style={styles.emojiIcon}>🗨️</Text>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
              <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
              <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
            </View>
          </LinearGradient>
          <Text style={styles.title}>Verify Your Number</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>We&apos;ve sent a 6-digit OTP to</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.phoneNumber}>{phoneNumberFromParams || '+91 98765 43210'}</Text>
              <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={14} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
             ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputActive : null
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              placeholderTextColor={Colors.dark.gray}
              selectionColor="#007AFF"
            />
          ))}
        </View>

        <Text style={styles.timer}>⏱ OTP expires in {formatTime(timer)}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.buttonWrapper}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButton, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify & Continue ✓'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn&apos;t receive the OTP?</Text>
          <TouchableOpacity style={styles.resendButton} onPress={() => setTimer(42)}>
            <Text style={styles.resendButtonText}>🔄 Resend OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyNote}>
            🔒 Your number is safe. We never share your data with anyone.
          </Text>
        </View>

        <View style={styles.homeIndicator} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#2ECC70',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  emojiIcon: {
    fontSize: 36,
    position: 'relative',
    top: -2,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: '40%',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: Colors.dark.gray,
    fontSize: 16,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  editIcon: {
    marginLeft: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpInputActive: {
    borderColor: '#007AFF',
  },
  timer: {
    color: Colors.dark.gray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonWrapper: {
    marginBottom: 32,
  },
  gradientButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 'auto',
  },
  resendText: {
    color: Colors.dark.gray,
    fontSize: 14,
    marginBottom: 12,
  },
  resendButton: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  privacyContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  privacyNote: {
    color: '#00FF7F',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  homeIndicator: {
    width: 140,
    height: 5,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 8,
  },
});