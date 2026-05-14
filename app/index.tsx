import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { auth, db, setConfirmationResult } from '@/src/config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: '1066456039416-p7kr89h590n7r7gme438tpmlic8nd4ja.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (cleaned.length === 10) {
        setError('');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      const { user } = userCredential;
      
      // Save user to Firestore if it's the first time
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        await userRef.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: firestore.FieldValue.serverTimestamp(),
          phoneNumber: user.phoneNumber,
          authProvider: 'google',
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await userRef.update({
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });
      }

      setLoading(false);
      router.replace('/welcome');
    } catch (err: any) {
      setLoading(false);
      console.error('Google Sign In Error:', err);
      // Only show alert if it's not a cancellation
      if (err.code !== 'SIGN_IN_CANCELLED' && err.code !== 'ASYNC_OP_IN_PROGRESS') {
        Alert.alert('Error', 'Google Sign In failed');
      }
    }
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const fullPhoneNumber = `+91${phoneNumber}`;

    try {
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setConfirmationResult(confirmation);
      setLoading(false);

      router.push({
        pathname: '/otp',
        params: { phone: fullPhoneNumber }
      });
    } catch (err: any) {
      setLoading(false);
      console.error('Firebase Auth Error:', err);

      if (err.code === 'auth/billing-not-enabled' || err.code === 'auth/billing-not' || err.message?.includes('BILLING_NOT_ENABLED')) {
        Alert.alert(
          '🔒 Firebase Billing Required',
          'Real OTP service requires a Firebase Blaze plan.\n\nPlease use a test phone number configured in your Firebase Console, or enable billing to use real numbers.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        Alert.alert('Too Many Requests', 'Please wait a few minutes before trying again.');
      } else {
        Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
      }
    }
  };

  const isButtonDisabled = loading || phoneNumber.length !== 10;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={['#007AFF', '#00C6FF']}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>VA</Text>
          </LinearGradient>
          <Text style={styles.appName}>VehicleAlert</Text>
          <Text style={styles.tagline}>Connect. Alert. Resolve.</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, error ? styles.inputError : null]}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={Colors.dark.gray}
              keyboardType="number-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              maxLength={10}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonWrapper}
            onPress={handleSendOTP}
            disabled={isButtonDisabled}
          >
            <LinearGradient
              colors={isButtonDisabled ? ['#2C2C2E', '#2C2C2E'] : ['#007AFF', '#0055FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientButton, loading && { opacity: 0.7 }]}
            >
              <Text style={[styles.buttonText, isButtonDisabled && { color: '#8E8E93' }]}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.googleButton, loading && { opacity: 0.7 }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="white" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>
              {loading && !phoneNumber ? 'Connecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.privacyNote}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    color: Colors.dark.gray,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#2C2C2E',
  },
  flag: {
    fontSize: 20,
    marginRight: 4,
  },
  codeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    marginBottom: 24,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  dividerText: {
    color: Colors.dark.gray,
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 20,
    alignItems: 'center',
  },
  privacyNote: {
    color: Colors.dark.gray,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#007AFF',
  },
});