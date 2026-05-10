import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const steps = [
    { id: '1', emoji: '🚗', text: 'Register your vehicle' },
    { id: '2', emoji: '🔍', text: 'Search any vehicle number' },
    { id: '3', emoji: '📢', text: 'Send anonymous alerts' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={60} color="white" />
          </View>
          <Text style={styles.title}>You&apos;re All Set! 🎉</Text>
          <Text style={styles.subtitle}>
            Welcome to VehicleAlert{'\n'}Your account is verified and ready!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get started in 3 steps</Text>
          {steps.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{step.id}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.emoji}>{step.emoji}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.buttonWrapper}
            onPress={() => router.push('/home')}
          >
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Go to Home 🏠</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home')}>
            <Text style={styles.exploreLater}>I&apos;ll explore later</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeIndicator} />
      </View>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.dark.gray,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 30,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrow: {
    color: '#3A3A3C',
    marginHorizontal: 12,
    fontSize: 18,
  },
  emoji: {
    fontSize: 22,
  },
  stepText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 100,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
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
  exploreLater: {
    color: Colors.dark.gray,
    fontSize: 14,
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
