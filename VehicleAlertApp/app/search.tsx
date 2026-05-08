import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      setShowResult(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.heading}>Find Vehicle</Text>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.inputWrapper}>
              <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search vehicle number..."
                placeholderTextColor="#636366"
                value={searchQuery}
                onChangeText={(text) => {
                    setSearchQuery(text.toUpperCase());
                    setShowResult(false);
                }}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.platePreview}>
              <View style={styles.plate}>
                <View style={styles.plateLeft}>
                  <Text style={styles.indText}>IND</Text>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                </View>
                <Text style={styles.plateNumber}>
                  {searchQuery || 'MH 12 AB 3456'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.searchButtonWrapper}
              onPress={handleSearch}
            >
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Search Vehicle 🔍</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {showResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultHeading}>✅ Vehicle Found!</Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.rowLabel}>Vehicle No.</Text>
                  <Text style={styles.rowValue}>{searchQuery}</Text>
                </View>
                <View style={styles.resultDivider} />
                
                <View style={styles.resultRow}>
                  <Text style={styles.rowLabel}>Owner Status</Text>
                  <Text style={[styles.rowValue, { color: '#34C759' }]}>Registered ✓</Text>
                </View>
                <View style={styles.resultDivider} />
                
                <View style={styles.resultRow}>
                  <Text style={styles.rowLabel}>Vehicle Type</Text>
                  <Text style={styles.rowValue}>Car - Sedan</Text>
                </View>
                <View style={styles.resultDivider} />
                
                <View style={styles.resultRow}>
                  <Text style={styles.rowLabel}>Last Alert</Text>
                  <Text style={styles.rowValue}>None sent yet</Text>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.sendAlertButton}
                onPress={() => router.push({
                  pathname: '/send-alert',
                  params: { vehicleNumber: searchQuery }
                })}
              >
                <Text style={styles.sendAlertText}>📢 Send Alert to Owner</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={24} color="#007AFF" />
          <Text style={[styles.navText, { color: '#007AFF' }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  heading: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchSection: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  platePreview: {
    alignItems: 'center',
    marginBottom: 32,
  },
  plate: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  plateLeft: {
    alignItems: 'center',
    marginRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    paddingRight: 10,
  },
  indText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flagEmoji: {
    fontSize: 14,
  },
  plateNumber: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 2,
  },
  searchButtonWrapper: {
    width: '100%',
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
  resultContainer: {
    width: '100%',
  },
  resultCard: {
    backgroundColor: '#161920',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 20,
  },
  resultHeading: {
    color: '#34C759',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    color: '#8E8E93',
    fontSize: 15,
  },
  rowValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  sendAlertButton: {
    backgroundColor: '#FF9500',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendAlertText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
