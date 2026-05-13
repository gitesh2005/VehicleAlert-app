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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { sendAlert, getUserDailyAlertCount } from '@/src/services/alertService';
import { auth } from '@/src/config/firebase';

export default function SendAlertScreen() {
  const router = useRouter();
  const { vehicleNumber } = useLocalSearchParams<{ vehicleNumber: string }>();
  const [selectedAlert, setSelectedAlert] = useState('Wrong Parking');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const displayVehicleNumber = vehicleNumber || 'Unknown Vehicle';
  const isSendDisabled = !vehicleNumber || loading;

  const alertTypes = [
    {
      id: 'Wrong Parking',
      title: 'Wrong Parking',
      subtitle: 'Vehicle blocking road/gate',
      icon: 'P',
      iconColor: '#e8570a',
      isTextIcon: true,
    },
    {
      id: 'Lights Left On',
      title: 'Lights Left On',
      subtitle: 'Headlights/indicators on',
      icon: '💡',
      iconColor: '#FFD700',
    },
    {
      id: 'Reckless Driving',
      title: 'Reckless Driving',
      subtitle: 'Dangerous driving reported',
      icon: '🔥',
      iconColor: '#FF4500',
    },
    {
      id: 'Vehicle Issue',
      title: 'Vehicle Issue',
      subtitle: 'Tyre, door or other issue',
      icon: '🔧',
      iconColor: '#8b949e',
    },
  ];

  const handleSendAlert = async () => {
    if (isSendDisabled) return;

    const user = auth().currentUser;
    if (!user) {
      router.replace('/');
      return;
    }

    setLoading(true);
    try {
      // Check daily alert limit
      const dailyCount = await getUserDailyAlertCount(user.uid);
      if (dailyCount >= 10) {
        setLoading(false);
        Alert.alert('Limit Reached', 'Maximum 10 alerts allowed per day to prevent spam.');
        return;
      }

      await sendAlert(
        user.uid,
        displayVehicleNumber,
        selectedAlert,
        message
      );
      
      setLoading(false);
      Alert.alert(
        "Success",
        "✅ Alert sent successfully! The owner will be notified.",
        [{ text: "OK" }]
      );

      setTimeout(() => {
        router.push('/home');
      }, 1000);

    } catch (error) {
      setLoading(false);
      console.error('Error sending alert:', error);
      Alert.alert(
        "Error",
        "❌ Failed to send alert. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#e8570a', '#0d1117']}
          style={styles.headerGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.topRow}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.headerTitle}>Send Alert</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainContent}>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleInfoLeft}>
              <Text style={styles.carEmoji}>🚗</Text>
              <Text style={styles.vehicleNumberText}>{displayVehicleNumber}</Text>
            </View>
            <View style={styles.vehicleInfoRight}>
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={styles.anonymousText}>Protected</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Select Alert Type</Text>
          <View style={styles.alertGrid}>
            {alertTypes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.alertCard,
                  selectedAlert === item.id && styles.selectedAlertCard,
                ]}
                onPress={() => setSelectedAlert(item.id)}
              >
                <View style={styles.alertCardTop}>
                  <View style={[styles.iconSquare, { backgroundColor: item.isTextIcon ? item.iconColor : 'rgba(255,255,255,0.05)' }]}>
                    {item.isTextIcon ? (
                      <Text style={styles.pIconText}>{item.icon}</Text>
                    ) : (
                      <Text style={styles.emojiIcon}>{item.icon}</Text>
                    )}
                  </View>
                  <Text style={styles.alertCardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.alertCardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Add Message (Optional)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Your car is blocking the entrance..."
            placeholderTextColor="#8b949e"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />

          <View style={styles.anonymousBanner}>
            <Text style={styles.bannerEmoji}>🔒</Text>
            <Text style={styles.bannerText}>
              Your identity is protected. We prevent spam through daily alert limits.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.sendButtonContainer, isSendDisabled && styles.disabledButton]} 
            activeOpacity={0.8}
            onPress={handleSendAlert}
            disabled={isSendDisabled}
          >
            <LinearGradient
              colors={isSendDisabled && !loading ? ['#30363d', '#30363d'] : ['#e8570a', '#f0720a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.sendButtonText}>📋 Send Alert Now</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  headerGradient: {
    paddingBottom: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#8b949e',
    fontSize: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainContent: {
    paddingHorizontal: 16,
    marginTop: -20,
    paddingBottom: 40,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 16,
  },
  vehicleInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  vehicleNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  vehicleInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  anonymousText: {
    color: '#3fb950',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  alertGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  alertCard: {
    width: '48%',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: 100,
    marginBottom: 12,
  },
  selectedAlertCard: {
    borderColor: '#e8570a',
    borderWidth: 1.5,
  },
  alertCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pIconText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emojiIcon: {
    fontSize: 20,
  },
  alertCardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1,
  },
  alertCardSubtitle: {
    color: '#8b949e',
    fontSize: 11,
  },
  messageInput: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    height: 120,
    borderWidth: 1,
    borderColor: '#30363d',
    fontSize: 15,
    marginBottom: 16,
  },
  anonymousBanner: {
    flexDirection: 'row',
    backgroundColor: '#0d2818',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#238636',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  bannerText: {
    color: '#3fb950',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  sendButtonContainer: {
    marginTop: 8,
    shadowColor: '#e8570a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sendButton: {
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    color: '#8b949e',
    fontSize: 16,
  },
});
