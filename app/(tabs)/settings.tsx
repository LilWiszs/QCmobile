import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type SettingsErrors = {
  clinicName?: string;
  workingHours?: string;
  maxQueueSize?: string;
};

type ThresholdRange = {
  min: string;
  max: string;
};

type Thresholds = {
  temperature: ThresholdRange;
  pulseRate: ThresholdRange;
  bloodPressureSystolic: ThresholdRange;
  bloodPressureDiastolic: ThresholdRange;
  weight: ThresholdRange;
  deviceUptimeWarning: string;
};

export default function SettingsScreen() {
  const { mode, setMode, colors } = useAppTheme();

  const [systemSettings, setSystemSettings] = useState({
    clinicName: 'QuickCare Medical Clinic',
    workingHours: '08:00-17:00',
    maxQueueSize: '50',
    darkMode: mode === 'dark',
    soundNotifications: true,
  });

  const [settingsErrors, setSettingsErrors] = useState<SettingsErrors>({});

  const [thresholds, setThresholds] = useState<Thresholds>({
    temperature: { min: '36.0', max: '37.5' },
    pulseRate: { min: '60', max: '100' },
    bloodPressureSystolic: { min: '90', max: '120' },
    bloodPressureDiastolic: { min: '60', max: '80' },
    weight: { min: '40', max: '120' },
    deviceUptimeWarning: '90',
  });

  useEffect(() => {
    setSystemSettings((prev) => ({
      ...prev,
      darkMode: mode === 'dark',
    }));
  }, [mode]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          router.replace('/login');
        },
      },
    ]);
  };

  const handleSettingsChange = (
    field: keyof typeof systemSettings,
    value: string | boolean
  ) => {
    setSystemSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      typeof value === 'string' &&
      settingsErrors[field as keyof SettingsErrors]
    ) {
      setSettingsErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleToggleSetting = (
    field: 'darkMode' | 'soundNotifications'
  ) => {
    if (field === 'darkMode') {
      const nextDarkMode = !systemSettings.darkMode;

      setSystemSettings((prev) => ({
        ...prev,
        darkMode: nextDarkMode,
      }));

      setMode(nextDarkMode ? 'dark' : 'light');
      return;
    }

    setSystemSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdateThreshold = (
    category:
      | 'temperature'
      | 'pulseRate'
      | 'bloodPressureSystolic'
      | 'bloodPressureDiastolic'
      | 'weight',
    bound: 'min' | 'max',
    value: string
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [bound]: value,
      },
    }));
  };

  const validateSettings = () => {
    const errors: SettingsErrors = {};

    if (!systemSettings.clinicName.trim()) {
      errors.clinicName = 'Clinic name is required';
    }

    if (!systemSettings.workingHours.trim()) {
      errors.workingHours = 'Working hours are required';
    }

    const queueSize = Number(systemSettings.maxQueueSize);
    if (!systemSettings.maxQueueSize.trim()) {
      errors.maxQueueSize = 'Max queue size is required';
    } else if (isNaN(queueSize) || queueSize < 5 || queueSize > 100) {
      errors.maxQueueSize = 'Queue size must be between 5 and 100';
    }

    return errors;
  };

  const handleSettingsSubmit = () => {
    const errors = validateSettings();

    if (Object.keys(errors).length > 0) {
      setSettingsErrors(errors);
      Alert.alert('Validation Error', 'Please fix the settings form errors.');
      return;
    }

    setSettingsErrors({});
    Alert.alert('Settings Saved', 'System settings have been updated.');
  };

  const handleSaveThresholds = () => {
    Alert.alert('Thresholds Saved', 'Vital sign thresholds have been updated.');
  };

  const renderThresholdInput = (
    title: string,
    category:
      | 'temperature'
      | 'pulseRate'
      | 'bloodPressureSystolic'
      | 'bloodPressureDiastolic'
      | 'weight'
  ) => (
    <View style={[styles.thresholdGroup, { backgroundColor: colors.muted }]}>
      <Text style={[styles.thresholdTitle, { color: colors.text }]}>{title}</Text>

      <View style={styles.thresholdInputs}>
        <View style={styles.thresholdInput}>
          <Text style={[styles.thresholdLabel, { color: colors.subText }]}>Min</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            value={thresholds[category].min}
            onChangeText={(text) => handleUpdateThreshold(category, 'min', text)}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subText}
          />
        </View>

        <View style={styles.thresholdInput}>
          <Text style={[styles.thresholdLabel, { color: colors.subText }]}>Max</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            value={thresholds[category].max}
            onChangeText={(text) => handleUpdateThreshold(category, 'max', text)}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subText}
          />
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              System Settings & Configuration
            </ThemedText>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Clinic Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  settingsErrors.clinicName && styles.inputError,
                ]}
                value={systemSettings.clinicName}
                onChangeText={(text) => handleSettingsChange('clinicName', text)}
                placeholder="Enter clinic name"
                placeholderTextColor={colors.subText}
              />
              {settingsErrors.clinicName ? (
                <Text style={styles.errorMessage}>{settingsErrors.clinicName}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Working Hours *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  settingsErrors.workingHours && styles.inputError,
                ]}
                value={systemSettings.workingHours}
                onChangeText={(text) => handleSettingsChange('workingHours', text)}
                placeholder="08:00-17:00"
                placeholderTextColor={colors.subText}
              />
              {settingsErrors.workingHours ? (
                <Text style={styles.errorMessage}>{settingsErrors.workingHours}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Max Queue Size (5-100) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  settingsErrors.maxQueueSize && styles.inputError,
                ]}
                value={systemSettings.maxQueueSize}
                onChangeText={(text) => handleSettingsChange('maxQueueSize', text)}
                keyboardType="number-pad"
                placeholderTextColor={colors.subText}
              />
              {settingsErrors.maxQueueSize ? (
                <Text style={styles.errorMessage}>{settingsErrors.maxQueueSize}</Text>
              ) : null}
            </View>

            <View style={styles.settingsToggles}>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Dark Mode</Text>
                <Switch
                  value={systemSettings.darkMode}
                  onValueChange={() => handleToggleSetting('darkMode')}
                  trackColor={{ false: '#d1d5db', true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Sound Notifications
                </Text>
                <Switch
                  value={systemSettings.soundNotifications}
                  onValueChange={() => handleToggleSetting('soundNotifications')}
                  trackColor={{ false: '#d1d5db', true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSettingsSubmit}
            >
              <Text style={styles.submitButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Vital Sign Thresholds
            </ThemedText>

            <Text style={[styles.sectionDescription, { color: colors.subText }]}>
              Set alert thresholds for vital sign readings
            </Text>

            {renderThresholdInput('Temperature (°C)', 'temperature')}
            {renderThresholdInput('Pulse Rate (bpm)', 'pulseRate')}
            {renderThresholdInput('BP Systolic', 'bloodPressureSystolic')}
            {renderThresholdInput('BP Diastolic', 'bloodPressureDiastolic')}
            {renderThresholdInput('Weight (kg)', 'weight')}

            <View style={[styles.thresholdGroup, { backgroundColor: colors.muted }]}>
              <Text style={[styles.thresholdTitle, { color: colors.text }]}>
                Device Uptime Alert
              </Text>

              <View style={styles.thresholdInputFull}>
                <Text style={[styles.thresholdLabel, { color: colors.subText }]}>
                  Alert if below (%)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.input, color: colors.text },
                  ]}
                  value={thresholds.deviceUptimeWarning}
                  onChangeText={(text) =>
                    setThresholds((prev) => ({
                      ...prev,
                      deviceUptimeWarning: text,
                    }))
                  }
                  keyboardType="number-pad"
                  placeholderTextColor={colors.subText}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveThresholds}
            >
              <Text style={styles.submitButtonText}>Save Thresholds</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Current Configuration
            </ThemedText>

            <View style={styles.settingsDisplay}>
              <View style={[styles.settingDisplayItem, { backgroundColor: colors.muted }]}>
                <Text style={[styles.settingLabel, { color: colors.subText }]}>Clinic Name:</Text>
                <Text style={[styles.settingValue, { color: colors.text }]}>
                  {systemSettings.clinicName}
                </Text>
              </View>

              <View style={[styles.settingDisplayItem, { backgroundColor: colors.muted }]}>
                <Text style={[styles.settingLabel, { color: colors.subText }]}>
                  Working Hours:
                </Text>
                <Text style={[styles.settingValue, { color: colors.text }]}>
                  {systemSettings.workingHours}
                </Text>
              </View>

              <View style={[styles.settingDisplayItem, { backgroundColor: colors.muted }]}>
                <Text style={[styles.settingLabel, { color: colors.subText }]}>
                  Max Queue Size:
                </Text>
                <Text style={[styles.settingValue, { color: colors.text }]}>
                  {systemSettings.maxQueueSize}
                </Text>
              </View>

              <View style={[styles.settingDisplayItem, { backgroundColor: colors.muted }]}>
                <Text style={[styles.settingLabel, { color: colors.subText }]}>Dark Mode:</Text>
                <Text style={[styles.settingValue, { color: colors.text }]}>
                  {systemSettings.darkMode ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              <View style={[styles.settingDisplayItem, { backgroundColor: colors.muted }]}>
                <Text style={[styles.settingLabel, { color: colors.subText }]}>
                  Sound Notifications:
                </Text>
                <Text style={[styles.settingValue, { color: colors.text }]}>
                  {systemSettings.soundNotifications ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.danger }]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  settingsToggles: {
    marginTop: 6,
    marginBottom: 16,
    gap: 14,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  thresholdGroup: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  thresholdTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  thresholdInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  thresholdInput: {
    flex: 1,
  },
  thresholdInputFull: {},
  thresholdLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  settingsDisplay: {
    gap: 12,
  },
  settingDisplayItem: {
    borderRadius: 12,
    padding: 12,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 15,
  },
  logoutContainer: {
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});