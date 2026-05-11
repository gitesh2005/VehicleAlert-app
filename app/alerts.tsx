import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../src/config/firebase';
import { deleteAlert, markAlertAsRead } from '../src/services/alertService';

const ALERT_META: Record<string, { emoji: string, color: string }> = {
  'Wrong Parking': { emoji: '🅿️', color: '#FF9500' },
  'Lights Left On': { emoji: '💡', color: '#FFCC00' },
  'Reckless Driving': { emoji: '🚨', color: '#FF4444' },
  'Vehicle Issue': { emoji: '🔧', color: '#007AFF' },
};

export default function AlertsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Received' | 'Sent'>('Received');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivedAlerts, setReceivedAlerts] = useState<any[]>([]);
  const [sentAlerts, setSentAlerts] = useState<any[]>([]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubscribeReceived: () => void = () => {};
    let unsubscribeSent: () => void = () => {};

    // 1. Listen for received alerts
    const listenToReceivedAlerts = () => {
      unsubscribeReceived = db.collection('alerts')
        .where('toUserId', '==', userId)
        .onSnapshot(snapshot => {
          if (snapshot) {
            const alerts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setReceivedAlerts(sortAlerts(alerts));
            setError(null);
          }
          setLoading(false);
        }, err => {
          console.error("Received alerts listener error:", err);
          if (err.message?.includes('permission-denied')) {
            setError("Permission denied. Please check your Firestore rules.");
          } else {
            setError("Failed to load received alerts.");
          }
          setLoading(false);
        });
    };

    // 2. Listen for sent alerts
    unsubscribeSent = db.collection('alerts')
      .where('fromUserId', '==', userId)
      .orderBy('sentAt', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        if (snapshot) {
          const alerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSentAlerts(alerts);
        }
      }, err => {
        // If index is missing, fallback to client-side sorting
        if (err.message?.includes('requires an index')) {
          console.warn("Sent alerts index missing, falling back to client-side sort");
          db.collection('alerts')
            .where('fromUserId', '==', userId)
            .limit(20)
            .onSnapshot(snapshot => {
              if (snapshot) {
                const alerts = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                setSentAlerts(sortAlerts(alerts));
              }
            });
        } else {
          console.error("Sent alerts listener error:", err);
        }
      });

    listenToReceivedAlerts();

    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, []);

  const sortAlerts = (alerts: any[]) => {
    return [...alerts].sort((a, b) => {
      const timeA = a.sentAt?.toDate ? a.sentAt.toDate().getTime() : 0;
      const timeB = b.sentAt?.toDate ? b.sentAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
  };

  const handleReceivedAlertPress = async (alert: any) => {
    // 1. Mark as read first
    if (!alert.isRead) {
      try {
        await markAlertAsRead(alert.id);
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // 2. Redirect to false report screen
    router.push({
      pathname: '/report-false-alert',
      params: {
        alertId: alert.id,
        vehicleNumber: alert.toVehicleNumber,
        alertType: alert.alertType
      }
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteAlert(alertId);
            } catch (error) {
              console.error("Error deleting alert:", error);
              Alert.alert("Error", "Failed to delete alert");
            }
          }
        }
      ]
    );
  };

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const alerts = activeTab === 'Received' ? receivedAlerts : sentAlerts;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.heading}>My Alerts</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => setActiveTab('Received')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'Received' && styles.activeTabText
            ]}>Received</Text>
            {activeTab === 'Received' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => setActiveTab('Sent')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'Sent' && styles.activeTabText
            ]}>Sent</Text>
            {activeTab === 'Sent' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {error ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
                <Text style={[styles.emptyText, { color: '#FF4444', marginTop: 16 }]}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => router.replace('/alerts')}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => {
                const meta = ALERT_META[alert.alertType] || { emoji: '🚨', color: '#8E8E93' };
                const isSentByMe = activeTab === 'Sent';
                
                return (
                  <TouchableOpacity 
                    key={alert.id} 
                    style={styles.alertCard}
                    onPress={() => !isSentByMe && handleReceivedAlertPress(alert)}
                    onLongPress={() => isSentByMe && handleDeleteAlert(alert.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.alertLeft}>
                      <Text style={styles.alertEmoji}>{meta.emoji}</Text>
                      <View style={styles.alertInfo}>
                        <Text style={styles.alertTitle}>{alert.alertType}</Text>
                        <Text style={styles.alertDesc}>{alert.toVehicleNumber}</Text>
                        <View style={styles.alertFooter}>
                          <Text style={styles.alertTime}>{timeAgo(alert.sentAt)}</Text>
                          {isSentByMe && (
                            <Text style={styles.alertStatus}>
                               • {alert.status === 'sent' ? 'Delivered ✅' : 'Pending ⏳'}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {!isSentByMe && !alert.isRead && (
                      <View style={[styles.statusDot, { backgroundColor: '#007AFF' }]} />
                    )}
                    
                    {isSentByMe && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAlert(alert.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{activeTab === 'Received' ? '🎉' : '📢'}</Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'Received' ? 'No alerts yet' : 'No alerts sent yet'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications" size={24} color="#007AFF" />
          <Text style={[styles.navText, { color: '#007AFF' }]}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 32,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#007AFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  alertCard: {
    backgroundColor: '#161920',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 11,
    color: '#636366',
  },
  alertStatus: {
    fontSize: 11,
    color: '#00FF7F',
    marginLeft: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  navText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

