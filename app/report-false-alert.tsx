import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '@/src/config/firebase';
import { submitFalseReport } from '@/src/services/alertService';

const REASONS = [
  { id: '1', label: 'My vehicle was parked correctly' },
  { id: '2', label: 'Wrong vehicle number reported' },
  { id: '3', label: 'This was a prank/joke alert' },
  { id: '4', label: 'Harassment / repeated false alerts' },
  { id: '5', label: 'Other reason' },
];

export default function ReportFalseAlertScreen() {
  const router = useRouter();

  const { alertId, vehicleNumber, alertType } = useLocalSearchParams<{
    alertId: string;
    vehicleNumber: string;
    alertType: string;
  }>();

  const [selectedReason, setSelectedReason] = useState('3');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!alertId || !vehicleNumber) {
      Alert.alert("Error", "Missing alert information.");
      return;
    }

    setLoading(true);

    const userId = auth().currentUser?.uid || 'anonymous';

    try {
      await submitFalseReport(
        userId,
        vehicleNumber,
        alertId,
        REASONS.find((reason) => reason.id === selectedReason)?.label || 'Other',
        details
      );

      setLoading(false);

      Alert.alert(
        "Success",
        "✅ Report submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error("Report error:", error);
      Alert.alert("Error", "❌ Failed to submit report. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#8B0000', '#0D0F14']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <Text style={styles.heading}>Report False Alert</Text>
              <Text style={styles.subtitle}>Help us keep the community safe</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.alertCard}>
            <Text style={styles.alertCardLabel}>Alert You Received</Text>
            <Text style={styles.alertInfo}>
              {alertType || 'Alert'} • {vehicleNumber || 'Unknown'}
            </Text>
          </View>

          <View style={styles.warningStrip}>
            <Text style={styles.warningText}>
              ⚠️ False reports may lead to your account being blocked
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Why is this alert wrong?</Text>

          <View style={styles.reasonsContainer}>
            {REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;

              return (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonCard,
                    isSelected && styles.selectedReasonCard,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <Text style={styles.reasonLabel}>{reason.label}</Text>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerCircle} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Additional details (optional)</Text>

          <TextInput
            style={styles.textarea}
            placeholder="Describe what actually happened..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>🚨 Submit Report</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: 30,
  },
  safeArea: {
    paddingTop: 44,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  alertCard: {
    backgroundColor: '#161920',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  alertCardLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
  },
  alertInfo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  warningStrip: {
    backgroundColor: '#1a1200',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    color: '#FFCC00',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  reasonsContainer: {
    marginBottom: 24,
  },
  reasonCard: {
    backgroundColor: '#161920',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedReasonCard: {
    borderColor: '#FF4444',
  },
  reasonLabel: {
    color: 'white',
    fontSize: 14,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FF4444',
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
  },
  textarea: {
    backgroundColor: '#161920',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 14,
    height: 100,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: '#FF4444',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});