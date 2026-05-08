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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [timer, setTimer] = useState(42);

  // Animation values for dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (value: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: -6,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 150),
      createAnimation(dot3, 300),
    ]).start();
  }, [dot1, dot2, dot3]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
              <Text style={styles.phoneNumber}>+91 98765 43210</Text>
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
              ref={(ref) => (inputRefs.current[index] = ref)}
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
          onPress={() => router.push('/welcome')}
        >
          <LinearGradient
            colors={['#007AFF', '#0055FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Verify & Continue ✓</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn&apos;t receive the OTP?</Text>
          <TouchableOpacity style={styles.resendButton}>
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