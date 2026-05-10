import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const registeredVehicles = [
    { id: '1', emoji: '🚗', plate: 'MH 12 AB 3456', status: 'Active' },
    { id: '2', emoji: '🚙', plate: 'DL 08 CD 7890', status: 'Active' },
  ];

  const stats = [
    { id: '1', count: '12', label: 'Alerts Sent' },
    { id: '2', count: '3', label: 'Received' },
    { id: '3', count: '8', label: 'Resolved' },
  ];

  const menuItems = [
    { id: '1', emoji: '🔔', label: 'Notification Settings' },
    { id: '2', emoji: '🔒', label: 'Privacy & Security' },
    { id: '3', emoji: '🛡️', label: 'Account Status', route: '/account-blocked' },
    { id: '4', emoji: '❓', label: 'Help & Support' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2d0080', '#0d1117']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Profile Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>GS</Text>
              </LinearGradient>
              <Text style={styles.phoneNumber}>+91 8307552640</Text>
            </View>

            {/* Registered Vehicles */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>My Registered Vehicles</Text>
              {registeredVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <View style={styles.vehicleLeft}>
                    <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                    <Text style={styles.vehiclePlate}>
                      {vehicle.plate} • {vehicle.status}
                    </Text>
                  </View>
                  <View style={styles.activeDot} />
                </View>
              ))}
              <TouchableOpacity style={styles.addVehicleButton}>
                <Text style={styles.addVehicleText}>+ Add New Vehicle</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
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

            {/* Settings Menu */}
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

            {/* Logout Row */}
            <TouchableOpacity style={styles.logoutRow}>
              <View style={styles.menuLeft}>
                <View style={styles.logoutIconWrapper}>
                   <Ionicons name="bookmark" size={18} color="#f85149" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f85149" opacity={0.5} />
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Navigation */}
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
    fontWeight: '500',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
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
});