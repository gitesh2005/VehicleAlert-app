import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AccountBlockedScreen() {
  const router = useRouter();

  const violationRows = [
    { label: 'False Alerts Reported', value: '12 times' },
    { label: 'Warnings Issued', value: '3 warnings' },
    { label: 'Account Status', value: 'Permanently Blocked', color: '#FF4444' },
    { label: 'Block Date', value: '05 May 2026' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Subtle Red Radial Glow Background Effect */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(255, 68, 68, 0.1)', 'transparent']}
          style={styles.glow}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.mainContainer}>
            {/* Big Circle with Emoji */}
            <View style={styles.iconCircle}>
              <Text style={styles.emojiIcon}>🚫</Text>
            </View>

            <Text style={styles.heading}>Account Blocked</Text>
            <Text style={styles.subtitle}>
              Your account has been permanently blocked due to repeated false alerts.
            </Text>

            {/* Violation History Card */}
            <View style={styles.violationCard}>
              <Text style={styles.violationLabel}>⚠️ Violation History</Text>
              {violationRows.map((row, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={[styles.rowValue, row.color ? { color: row.color } : null]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Policy Card */}
            <View style={styles.policyCard}>
              <Text style={styles.policyLabel}>📋 Our Policy</Text>
              <Text style={styles.policyText}>
                Accounts with 10+ verified false alert reports are permanently blocked to protect our community. This cannot be reversed.
              </Text>
            </View>

            {/* Appeal Section */}
            <TouchableOpacity style={styles.appealButton}>
              <Text style={styles.appealButtonText}>📩 Submit an Appeal</Text>
            </TouchableOpacity>

            <Text style={styles.appealNote}>
              Appeals are reviewed within 7-10 business days
            </Text>

            <TouchableOpacity style={styles.supportLink}>
              <Text style={styles.supportText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  glowContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glow: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  mainContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a0000',
    borderWidth: 2,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emojiIcon: {
    fontSize: 48,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  violationCard: {
    backgroundColor: '#120808',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#300000',
    width: '100%',
    padding: 20,
    marginBottom: 16,
  },
  violationLabel: {
    color: '#FF4444',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    color: '#8E8E93',
    fontSize: 13,
  },
  rowValue: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  policyCard: {
    backgroundColor: '#161920',
    borderRadius: 14,
    width: '100%',
    padding: 20,
    marginBottom: 32,
  },
  policyLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  policyText: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 20,
  },
  appealButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appealButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appealNote: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  supportLink: {
    padding: 10,
  },
  supportText: {
    color: '#4080FF',
    fontSize: 14,
    fontWeight: '600',
  },
});
