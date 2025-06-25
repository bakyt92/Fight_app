import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';

const SettingsScreen: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 123-4567',
    bio: 'Strategic communicator and negotiation enthusiast',
  });

  const [preferences, setPreferences] = useState({
    aggressiveMode: true,
    notifications: true,
    soundEffects: false,
    autoSave: true,
    darkMode: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your battle statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'Statistics have been reset.');
        }},
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data has been exported to your device.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AC</Text>
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileFields}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={profile.name}
                onChangeText={(text) => setProfile({...profile, name: text})}
                editable={isEditing}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={profile.email}
                onChangeText={(text) => setProfile({...profile, email: text})}
                editable={isEditing}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                style={[styles.fieldInput, !isEditing && styles.fieldInputDisabled]}
                value={profile.phone}
                onChangeText={(text) => setProfile({...profile, phone: text})}
                editable={isEditing}
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={[styles.fieldInput, styles.bioInput, !isEditing && styles.fieldInputDisabled]}
                value={profile.bio}
                onChangeText={(text) => setProfile({...profile, bio: text})}
                editable={isEditing}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Battle Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚔️ Battle Preferences</Text>
        
        <View style={styles.preferencesCard}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Aggressive Mode</Text>
              <Text style={styles.preferenceDescription}>Enable more assertive response suggestions</Text>
            </View>
            <Switch
              value={preferences.aggressiveMode}
              onValueChange={(value) => setPreferences({...preferences, aggressiveMode: value})}
              trackColor={{ false: '#767577', true: '#ff4444' }}
              thumbColor={preferences.aggressiveMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
              <Text style={styles.preferenceDescription}>Get notified about new strategies and tips</Text>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => setPreferences({...preferences, notifications: value})}
              trackColor={{ false: '#767577', true: '#ff4444' }}
              thumbColor={preferences.notifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Sound Effects</Text>
              <Text style={styles.preferenceDescription}>Play sounds for victories and defeats</Text>
            </View>
            <Switch
              value={preferences.soundEffects}
              onValueChange={(value) => setPreferences({...preferences, soundEffects: value})}
              trackColor={{ false: '#767577', true: '#ff4444' }}
              thumbColor={preferences.soundEffects ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Auto-Save History</Text>
              <Text style={styles.preferenceDescription}>Automatically save your battle results</Text>
            </View>
            <Switch
              value={preferences.autoSave}
              onValueChange={(value) => setPreferences({...preferences, autoSave: value})}
              trackColor={{ false: '#767577', true: '#ff4444' }}
              thumbColor={preferences.autoSave ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App Settings</Text>
        
        <View style={styles.settingsCard}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Dark Mode</Text>
              <Text style={styles.preferenceDescription}>Use dark theme for the app</Text>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={(value) => setPreferences({...preferences, darkMode: value})}
              trackColor={{ false: '#767577', true: '#ff4444' }}
              thumbColor={preferences.darkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Text style={styles.actionButtonText}>📤 Export My Data</Text>
          <Text style={styles.actionButtonSubtext}>Download your battle history and settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleResetStats}>
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>🗑️ Reset Statistics</Text>
          <Text style={styles.actionButtonSubtext}>Clear all battle history and stats</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>Version: 1.0.0</Text>
          <Text style={styles.infoItem}>Build: 2024.01.15</Text>
          <Text style={styles.infoItem}>Developer: Fight App Team</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  editButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    paddingVertical: 4,
  },
  changeAvatarText: {
    color: '#ff4444',
    fontSize: 14,
  },
  profileFields: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#ffffff',
  },
  fieldInputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  preferencesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  dangerButton: {
    borderLeftColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  dangerButtonText: {
    color: '#dc3545',
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: '#6c757d',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 8,
  },
});

export default SettingsScreen; 