import React, { useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth } from '@/src/config/firebase';
import { deleteVehicle } from '@/src/services/vehicleService';

const VEHICLE_EMOJIS: Record<string, string> = {
  'Car': '🚗',
  'Bike': '🏍️',
  'Bus': '🚌',
  'Truck': '🚛',
};

export default function ProfileScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState<number>(15);

  const isLoggingOutRef = useRef(false);

  // 1. Listen for user data
  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (!user) {
        return;
      }

      unsubscribeUser = db.collection('users').doc(user.uid)
        .onSnapshot(
          (doc) => {
            if (doc.exists) {
              const score = doc.data()?.trustScore ?? 15;
              
              if (score === 10 && trustScore > 10) {
                Alert.alert("⚠️ Warning", "Your trust score is dropping. Please avoid sending false alerts.");
              } else if (score === 5 && trustScore > 5) {
                Alert.alert("🔴 Danger", "Your trust score is critically low. Account may be blocked soon!");
              } else if (score === 0) {
                router.replace('/account-blocked');
                return;
              }
              
              setTrustScore(score);
            }
          },
          (error) => {
            if (!auth().currentUser || isLoggingOutRef.current) {
              return;
            }

            console.error("User data listener error:", error);
          }
        );
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      authUnsubscribe();
    };
  }, [trustScore, router]);

  // 2. Listen for user's vehicles
  useEffect(() => {
    let unsubscribeVehicles: (() => void) | null = null;

    const authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (unsubscribeVehicles) {
        unsubscribeVehicles();
        unsubscribeVehicles = null;
      }

      if (!user) {
        setVehicles([]);
        setVehicleNumbers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      unsubscribeVehicles = db.collection('vehicles')
        .where('userId', '==', user.uid)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot) {
              console.warn("Vehicles snapshot is null");
              setLoading(false);
              return;
            }

            const vehicleList = snapshot.docs.map((vehicleDoc: any) => ({
              id: vehicleDoc.id,
              ...vehicleDoc.data()
            }));

            setVehicles(vehicleList);
            setVehicleNumbers(vehicleList.map((v: any) => v.vehicleNumber));
            setLoading(false);
          },
          (error) => {
            if (!auth().currentUser || isLoggingOutRef.current) {
              return;
            }

            console.error("Vehicles listener error:", error);
            setLoading(false);
          }
        );
    });

    return () => {
      if (unsubscribeVehicles) {
        unsubscribeVehicles();
        unsubscribeVehicles = null;
      }

      authUnsubscribe();
    };
  }, []);

  const vehicleNumbersKey = vehicleNumbers.join(',');

  // 3. Listen for received/resolved alerts
  useEffect(() => {
    let unsubscribeReceived: (() => void) | null = null;

    const authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (unsubscribeReceived) {
        unsubscribeReceived();
        unsubscribeReceived = null;
      }

      if (!user) {
        setReceivedCount(0);
        setResolvedCount(0);
        return;
      }

      unsubscribeReceived = db.collection('alerts')
        .where('toUserId', '==', user.uid)
        .onSnapshot(
          (alertSnapshot) => {
            if (!alertSnapshot) {
              console.warn("Received alerts snapshot is null");
              return;
            }

            const alerts = alertSnapshot.docs.map((alertDoc: any) => alertDoc.data());
            setReceivedCount(alerts.length);
            setResolvedCount(alerts.filter((a: any) => a.status === 'resolved').length);
          },
          (error) => {
            if (!auth().currentUser || isLoggingOutRef.current) {
              return;
            }

            console.error("Received alerts listener error:", error);
          }
        );
    });

    return () => {
      if (unsubscribeReceived) {
        unsubscribeReceived();
        unsubscribeReceived = null;
      }

      authUnsubscribe();
    };
  }, []);

  // 4. Listen for sent alerts
  useEffect(() => {
    let unsubscribeSent: (() => void) | null = null;

    const authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (unsubscribeSent) {
        unsubscribeSent();
        unsubscribeSent = null;
      }

      if (!user) {
        setSentCount(0);
        return;
      }

      unsubscribeSent = db.collection('alerts')
        .where('fromUserId', '==', user.uid)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot) {
              console.warn("Sent alerts snapshot is null");
              return;
            }

            setSentCount(snapshot.size);
          },
          (error) => {
            if (!auth().currentUser || isLoggingOutRef.current) {
              return;
            }

            console.error("Sent alerts listener error:", error);
          }
        );
    });

    return () => {
      if (unsubscribeSent) {
        unsubscribeSent();
        unsubscribeSent = null;
      }

      authUnsubscribe();
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              isLoggingOutRef.current = true;

              setVehicles([]);
              setVehicleNumbers([]);
              setSentCount(0);
              setReceivedCount(0);
              setResolvedCount(0);

              await auth().signOut();

              router.replace('/');
            } catch (error) {
              isLoggingOutRef.current = false;
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const handleDeleteVehicle = (vehicleId: string, vehicleNumber: string) => {
    Alert.alert(
      "Remove Vehicle",
      `Are you sure you want to remove ${vehicleNumber} from VehicleAlert?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              Alert.alert("Success", "Vehicle removed successfully");
            } catch (error) {
              console.error("Delete vehicle error:", error);
              Alert.alert("Error", "Failed to remove vehicle. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const stats = [
    { id: '1', count: sentCount.toString(), label: 'Alerts Sent' },
    { id: '2', count: receivedCount.toString(), label: 'Received' },
    { id: '3', count: resolvedCount.toString(), label: 'Resolved' },
  ];

  const menuItems = [
    { id: '1', emoji: '🔔', label: 'Notification Settings' },
    { id: '2', emoji: '🔒', label: 'Privacy & Security' },
    { id: '3', emoji: '🛡️', label: 'Account Status', route: '/account-blocked' },
    { id: '4', emoji: '❓', label: 'Help & Support' },
  ];

  const getAccountStatus = (score: number) => {
    if (score >= 11) return { label: 'Active', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' };
    if (score >= 6) return { label: 'Warning', color: '#FFCC00', bg: 'rgba(255, 204, 0, 0.1)' };
    return { label: 'At Risk', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)' };
  };

  const status = getAccountStatus(trustScore);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2d0080', '#0d1117']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.header}>
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {auth().currentUser?.phoneNumber?.slice(-2) || 'GS'}
                </Text>
              </LinearGradient>
              <Text style={styles.phoneNumber}>
                {auth().currentUser?.phoneNumber || '+91 8307552640'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Account Status</Text>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDotSmall, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusLabelBadge, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Text style={styles.trustScoreText}>Trust Score: {trustScore}/15</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${(trustScore / 15) * 100}%`,
                        backgroundColor: status.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.resetText}>Score resets every midnight 🕛</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeading}>My Registered Vehicles</Text>
              
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color="#007AFF" size="large" />
                </View>
              ) : (
                <>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <View key={vehicle.id} style={styles.vehicleCard}>
                        <View style={styles.vehicleLeft}>
                          <Text style={styles.vehicleEmoji}>
                            {VEHICLE_EMOJIS[vehicle.vehicleType] || '🚗'}
                          </Text>
                          <View>
                            <Text style={styles.vehiclePlate}>
                              {vehicle.vehicleNumber}
                            </Text>
                            <Text style={styles.vehicleStatus}>
                              {vehicle.isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.vehicleRight}>
                          {vehicle.isActive && <View style={styles.activeDot} />}
                          <TouchableOpacity 
                            style={styles.deleteVehicleButton}
                            onPress={() => handleDeleteVehicle(vehicle.id, vehicle.vehicleNumber)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#f85149" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No vehicles registered yet</Text>
                      <TouchableOpacity 
                        style={styles.addVehicleButton}
                        onPress={() => router.push('/register-vehicle')}
                      >
                        <Text style={styles.addVehicleText}>Register Now</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {vehicles.length > 0 && (
                    <TouchableOpacity 
                      style={styles.addVehicleButton}
                      onPress={() => router.push('/register-vehicle')}
                    >
                      <Text style={styles.addVehicleText}>+ Add New Vehicle</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Your Stats</Text>
              <View style={styles.statsContainer}>
                {stats.map((stat) => (
                  <View key={stat.id} style={styles.statBox}>
                    <Text style={styles.statNumber}>{stat.count}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              {menuItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.menuRow}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={styles.menuLeft}>
                    <Text style={styles.menuEmoji}>{item.emoji}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8b949e" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <View style={styles.menuLeft}>
                <View style={styles.logoutIconWrapper}>
                   <Ionicons name="log-out-outline" size={18} color="#f85149" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f85149" opacity={0.5} />
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home-outline" size={24} color="#8e8e93" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color="#8e8e93" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/alerts')}>
          <Ionicons name="notifications-outline" size={24} color="#8e8e93" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#007AFF" />
          <Text style={[styles.navText, { color: '#007AFF' }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  phoneNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  emptyText: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 10,
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  vehiclePlate: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vehicleStatus: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 2,
  },
  vehicleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  deleteVehicleButton: {
    marginLeft: 12,
    padding: 10,
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: 8,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    marginRight: 4,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  addVehicleButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f6feb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  addVehicleText: {
    color: '#1f6feb',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '31%',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statNumber: {
    color: '#58a6ff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.2)',
    marginTop: 8,
  },
  logoutIconWrapper: {
    marginRight: 12,
  },
  logoutText: {
    color: '#f85149',
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
    color: '#8e8e93',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusLabelBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  trustScoreText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#30363d',
    borderRadius: 4,
    width: '100%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  resetText: {
    color: '#8b949e',
    fontSize: 10,
    textAlign: 'center',
  },
});