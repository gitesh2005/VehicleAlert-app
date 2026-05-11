import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth } from '../src/config/firebase';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: '1', emoji: '🚗', label: 'Register\nVehicle', color: '#1a237e' },
  { id: '2', emoji: '📢', label: 'Send\nAlert', color: '#bf360c' },
  { id: '3', emoji: '📊', label: 'My\nStats', color: '#1b5e20' },
  { id: '4', emoji: '🆘', label: 'Emergency', color: '#b71c1c' },
] as const;

const ALERT_TYPE_CONFIG: Record<string, { icon: any, color: string }> = {
  'Wrong Parking': { icon: 'parking', color: '#FF9500' },
  'Lights Left On': { icon: 'lightbulb-outline', color: '#FFCC00' },
  'Reckless Driving': { icon: 'alert-decagram-outline', color: '#FF4444' },
  'Vehicle Issue': { icon: 'wrench-outline', color: '#007AFF' },
};

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Get user's vehicles
      const vehiclesSnapshot = await db.collection('vehicles')
        .where('userId', '==', userId)
        .get();
      
      const myVehicleNumbers = vehiclesSnapshot.docs.map(doc => doc.data().vehicleNumber);

      if (myVehicleNumbers.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // 2. Get last 3 alerts (Sort client-side to avoid index error)
      const alertsSnapshot = await db.collection('alerts')
        .where('toVehicleNumber', 'in', myVehicleNumbers)
        .get();
      
      const allAlerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const sortedAlerts = allAlerts.sort((a, b) => {
        const timeA = a.sentAt?.toDate ? a.sentAt.toDate().getTime() : 0;
        const timeB = b.sentAt?.toDate ? b.sentAt.toDate().getTime() : 0;
        return timeB - timeA;
      }).slice(0, 3);

      setActivities(sortedAlerts);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds > 86400) return "Yesterday";
    return "Just now";
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! 👋';
    if (hour < 18) return 'Good Afternoon! ☀️';
    return 'Good Evening! 🌙';
  }, []);

  const handleActionPress = (id: string) => {
    switch (id) {
      case '1':
        router.push('/register-vehicle');
        break;
      case '2':
        router.push('/search');
        break;
      case '3':
        router.push('/profile');
        break;
      case '4':
        Alert.alert(
          "Emergency",
          "Are you sure you want to call emergency services?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Call 112", onPress: () => Linking.openURL('tel:112') }
          ]
        );
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <LinearGradient
          colors={['#007AFF', '#0055FF', '#0D0F14']}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.topRow}>
                <View style={styles.brandContainer}>
                  <LinearGradient
                    colors={['#FFFFFF', '#E0E0E0']}
                    style={styles.logoCircle}
                  >
                    <Text style={styles.logoText}>VA</Text>
                  </LinearGradient>
                  <View style={styles.brandTextContainer}>
                    <Text style={styles.appName}>VehicleAlert</Text>
                    <Text style={styles.tagline}>Connect. Alert. Resolve.</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.bellButton}
                  onPress={() => router.push('/alerts')}
                >
                  <Ionicons name="notifications-outline" size={24} color="white" />
                  {activities.some(a => !a.isRead) && <View style={styles.bellBadge} />}
                </TouchableOpacity>
              </View>

              <View style={styles.greetingContainer}>
                <Text style={styles.greetingTitle}>{greeting}</Text>
                <Text style={styles.greetingSubtitle}>What would you like to do today?</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainContent}>
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={[styles.actionCard, { backgroundColor: action.color }]}
                onPress={() => handleActionPress(action.id)}
              >
                <View style={styles.actionIconCircle}>
                  <Text style={styles.actionEmoji}>{action.emoji}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/alerts')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color="#007AFF" />
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const config = ALERT_TYPE_CONFIG[activity.alertType] || { icon: 'bell-outline', color: '#8E8E93' };
                  return (
                    <TouchableOpacity 
                      key={activity.id} 
                      style={styles.activityCard}
                      onPress={() => router.push('/alerts')}
                    >
                      <View style={styles.activityLeft}>
                        <View style={[styles.activityIconWrapper, { backgroundColor: config.color + '20' }]}>
                          <MaterialCommunityIcons name={config.icon} size={24} color={config.color} />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle}>{activity.alertType}</Text>
                          <Text style={styles.activityDesc}>
                            {activity.toVehicleNumber} • {timeAgo(activity.sentAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusDot, { backgroundColor: activity.isRead ? '#2C2C2E' : '#007AFF' }]} />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No recent activity</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={[styles.navText, { color: '#007AFF' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/alerts')}>
          <Ionicons name="notifications-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Alerts</Text>
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
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  appName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  greetingContainer: {
    marginBottom: 10,
  },
  greetingTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    alignItems: 'center',
    width: (width - 60) / 4,
    borderRadius: 16,
    paddingVertical: 12,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activitiesList: {
    gap: 12,
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDesc: {
    color: '#8E8E93',
    fontSize: 13,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
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
