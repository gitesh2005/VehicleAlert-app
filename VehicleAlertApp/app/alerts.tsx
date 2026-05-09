import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const RECEIVED_ALERTS = [
  {
    id: '1',
    emoji: '🅿️',
    title: 'Wrong Parking',
    desc: 'Someone alerted your MH 12 AB 3456',
    time: '2 hours ago',
    dotColor: '#FF9500', // orange
  },
  {
    id: '2',
    emoji: '💡',
    title: 'Lights Left On',
    desc: 'Someone alerted your DL 08 CD 7890',
    time: 'Yesterday',
    dotColor: '#FFCC00', // yellow
  },
];

const SENT_ALERTS = [
  {
    id: '1',
    emoji: '🚨',
    title: 'Reckless Driving',
    desc: 'You alerted KA 05 MN 2345',
    time: '3 hours ago',
    dotColor: '#FF4444', // red
  },
  {
    id: '2',
    emoji: '🔧',
    title: 'Vehicle Issue',
    desc: 'You alerted GJ 01 AB 1234',
    time: '2 days ago',
    dotColor: '#007AFF', // blue
  },
];

export default function AlertsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Received' | 'Sent'>('Received');

  const alerts = activeTab === 'Received' ? RECEIVED_ALERTS : SENT_ALERTS;

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

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertLeft}>
                <Text style={styles.alertEmoji}>{alert.emoji}</Text>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDesc}>{alert.desc}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: alert.dotColor }]} />
            </View>
          ))}
        </ScrollView>
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
  alertTime: {
    fontSize: 11,
    color: '#636366',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
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
