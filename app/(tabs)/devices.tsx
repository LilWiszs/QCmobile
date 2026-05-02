import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.22:8000';

type Device = {
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline';
  lastUpdate: string;
  reason?: string;
};

export default function DevicesScreen() {
  const { colors } = useAppTheme();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = (globalThis as any).authToken;

      const response = await fetch(`${API_BASE_URL}/api/devices/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Unable to load devices.');
        return;
      }

      const formattedDevices: Device[] = data.map((item: any) => ({
        id: Number(item.id),
        name: item.name ?? item.device_name ?? 'Unnamed Device',
        type: item.type ?? item.device_type ?? 'N/A',
        location: item.location ?? 'N/A',
        status: item.status?.toLowerCase() === 'offline' ? 'offline' : 'online',
        lastUpdate: item.last_update ?? item.updated_at ?? 'N/A',
        reason: item.reason ?? '',
      }));

      setDevices(formattedDevices);
    } catch (error: any) {
      setError(error?.message || 'Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const { totalDevices, onlineCount, offlineCount } = useMemo(() => {
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.filter((d) => d.status === 'offline').length;

    return {
      totalDevices: devices.length,
      onlineCount: online,
      offlineCount: offline,
    };
  }, [devices]);

  if (loading) {
    return (
      <ThemedView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading devices...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.danger }]}>Failed to load devices</Text>
        <Text style={[styles.errorText, { color: colors.subText }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchDevices}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
              Device & Sensor Management
            </ThemedText>

            <View style={styles.devicesSummary}>
              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Total</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalDevices}</Text>
              </View>

              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Online</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{onlineCount}</Text>
              </View>

              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Offline</Text>
                <Text style={[styles.statValue, { color: colors.danger }]}>{offlineCount}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
              Connected Devices
            </ThemedText>

            {devices.length === 0 ? (
              <Text style={[styles.errorText, { color: colors.subText }]}>No devices found from API.</Text>
            ) : (
              devices.map((device) => (
                <View
                  key={device.id}
                  style={[
                    styles.deviceItem,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.deviceName, { color: colors.text }]}>
                    {device.name}
                  </Text>

                  <Text style={{ color: colors.subText }}>
                    {device.type} | {device.location}
                  </Text>

                  <Text
                    style={{
                      color: device.status === 'online' ? colors.success : colors.danger,
                      marginTop: 6,
                      fontWeight: '600',
                    }}
                  >
                    {device.status.toUpperCase()}
                  </Text>

                  {device.reason ? (
                    <Text style={{ color: colors.subText, marginTop: 4 }}>
                      Reason: {device.reason}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: { paddingBottom: 24 },
  pageContent: { padding: 16, gap: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  devicesSummary: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  deviceItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  deviceName: {
    fontWeight: '700',
    fontSize: 16,
  },
});