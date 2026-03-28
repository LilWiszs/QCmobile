import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AlertItem = {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
};

type DailyVital = {
  time: string;
  temp: number;
  pulse: number;
  bp: string;
};

type WeeklyVital = {
  day: string;
  avgTemp: number;
  avgPulse: number;
};

type MonthlyVital = {
  week: string;
  avgTemp: number;
  avgPulse: number;
};

type Device = {
  id: number;
  name: string;
  status: 'online' | 'offline';
};

type UptimeMetrics = Record<string, number>;

export default function ReportsScreen() {
  const { colors } = useAppTheme();
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [alertHistory, setAlertHistory] = useState<AlertItem[]>([
    {
      id: 1,
      type: 'system',
      message: 'Queue is nearing max capacity.',
      timestamp: '10:20 AM',
      severity: 'medium',
      resolved: false,
    },
    {
      id: 2,
      type: 'device',
      message: 'Temperature Sensor #1 is offline.',
      timestamp: '09:50 AM',
      severity: 'high',
      resolved: false,
    },
    {
      id: 3,
      type: 'vitals',
      message: 'Patient John Doe has elevated pulse rate.',
      timestamp: '09:15 AM',
      severity: 'low',
      resolved: true,
    },
  ]);

  const [recentPatients] = useState([
    { id: 'P-1001', name: 'John Doe' },
    { id: 'P-1002', name: 'Jane Smith' },
    { id: 'P-1003', name: 'Michael Johnson' },
  ]);

  const [devices] = useState<Device[]>([
    { id: 1, name: 'Pulse Oximeter #1', status: 'online' },
    { id: 2, name: 'Blood Pressure Monitor #1', status: 'online' },
    { id: 3, name: 'Temperature Sensor #1', status: 'offline' },
    { id: 4, name: 'Heart Rate Monitor #1', status: 'online' },
  ]);

  const [queueStatus] = useState('Active');

  const thresholds = {
    deviceUptimeWarning: 90,
  };

  const vitalReadingsHistory: {
    daily: DailyVital[];
    weekly: WeeklyVital[];
    monthly: MonthlyVital[];
  } = {
    daily: [
      { time: '8AM', temp: 36.7, pulse: 75, bp: '120/80' },
      { time: '10AM', temp: 37.0, pulse: 78, bp: '118/79' },
      { time: '12PM', temp: 37.2, pulse: 82, bp: '121/80' },
      { time: '2PM', temp: 36.9, pulse: 77, bp: '119/78' },
      { time: '4PM', temp: 37.1, pulse: 80, bp: '120/79' },
    ],
    weekly: [
      { day: 'Mon', avgTemp: 36.8, avgPulse: 76 },
      { day: 'Tue', avgTemp: 37.0, avgPulse: 78 },
      { day: 'Wed', avgTemp: 37.1, avgPulse: 80 },
      { day: 'Thu', avgTemp: 36.9, avgPulse: 77 },
      { day: 'Fri', avgTemp: 37.2, avgPulse: 81 },
    ],
    monthly: [
      { week: 'W1', avgTemp: 36.9, avgPulse: 77 },
      { week: 'W2', avgTemp: 37.0, avgPulse: 78 },
      { week: 'W3', avgTemp: 37.1, avgPulse: 80 },
      { week: 'W4', avgTemp: 36.8, avgPulse: 76 },
    ],
  };

  const deviceUptimeMetrics: {
    daily: UptimeMetrics;
    weekly: UptimeMetrics;
    monthly: UptimeMetrics;
  } = {
    daily: {
      'Pulse Oximeter #1': 98,
      'Blood Pressure Monitor #1': 95,
      'Temperature Sensor #1': 82,
      'Heart Rate Monitor #1': 96,
    },
    weekly: {
      'Pulse Oximeter #1': 97,
      'Blood Pressure Monitor #1': 94,
      'Temperature Sensor #1': 85,
      'Heart Rate Monitor #1': 95,
    },
    monthly: {
      'Pulse Oximeter #1': 96,
      'Blood Pressure Monitor #1': 93,
      'Temperature Sensor #1': 84,
      'Heart Rate Monitor #1': 94,
    },
  };

  const handleClearAllAlerts = () => {
    Alert.alert('Clear All Alerts', 'Are you sure you want to clear all alerts?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => setAlertHistory([]),
      },
    ]);
  };

  const handleResolveAlert = (id: number) => {
    setAlertHistory((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert))
    );
  };

  const currentUptimeMetrics: UptimeMetrics =
    reportPeriod === 'daily'
      ? deviceUptimeMetrics.daily
      : reportPeriod === 'weekly'
      ? deviceUptimeMetrics.weekly
      : deviceUptimeMetrics.monthly;

  const activeAlertsCount = useMemo(
    () => alertHistory.filter((a) => !a.resolved).length,
    [alertHistory]
  );

  const onlineDevicesCount = useMemo(
    () => devices.filter((d) => d.status === 'online').length,
    [devices]
  );

  const getSeverityStyle = (severity: AlertItem['severity']) => {
    if (severity === 'high') {
      return { borderColor: '#f7c2c2', backgroundColor: '#fff3f3' };
    }
    if (severity === 'medium') {
      return { borderColor: '#ffe2b8', backgroundColor: '#fff8ef' };
    }
    return { borderColor: '#cfe8ff', backgroundColor: '#f4f9ff' };
  };

  const renderPeriodButton = (
    period: 'daily' | 'weekly' | 'monthly',
    label: string
  ) => (
    <TouchableOpacity
      onPress={() => setReportPeriod(period)}
      style={[
        styles.periodBtn,
        { backgroundColor: reportPeriod === period ? colors.primary : colors.muted },
      ]}>
      <Text
        style={[
          styles.periodBtnText,
          { color: reportPeriod === period ? '#fff' : colors.text },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderChartBars = (
    data: number[],
    labels: string[],
    maxValue: number,
    barColor: string
  ) => (
    <>
      <View style={styles.simpleChart}>
        {data.map((value, idx) => (
          <View key={idx} style={styles.chartBarWrapper}>
            <View
              style={[
                styles.chartBar,
                {
                  backgroundColor: barColor,
                  height: Math.max((value / maxValue) * 140, 12),
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.chartLabels}>
        {labels.map((label, idx) => (
          <Text key={idx} style={[styles.chartLabelText, { color: colors.subText }]}>
            {label}
          </Text>
        ))}
      </View>
    </>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.alertsHeader}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                ⚠️ Alerts & Notifications
              </ThemedText>

              <TouchableOpacity
                onPress={handleClearAllAlerts}
                style={[styles.secondaryButton, { backgroundColor: colors.muted }]}>
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsList}>
              {alertHistory.length > 0 ? (
                alertHistory.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      getSeverityStyle(alert.severity),
                      alert.resolved && styles.alertResolved,
                    ]}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                      <Text style={[styles.alertMessage, { color: colors.text }]}>
                        {alert.message}
                      </Text>
                      <Text style={[styles.alertTime, { color: colors.subText }]}>
                        {alert.timestamp}
                      </Text>
                    </View>

                    {!alert.resolved ? (
                      <TouchableOpacity
                        onPress={() => handleResolveAlert(alert.id)}
                        style={[styles.resolveButton, { backgroundColor: colors.primary }]}>
                        <Text style={styles.resolveButtonText}>Resolve</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.alertResolvedBadge, { color: colors.success }]}>
                        ✓ Resolved
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyState, { color: colors.subText }]}>No alerts</Text>
              )}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Vital Signs Report
            </ThemedText>

            <View style={styles.reportPeriodSelector}>
              {renderPeriodButton('daily', '📅 Daily')}
              {renderPeriodButton('weekly', '📊 Weekly')}
              {renderPeriodButton('monthly', '📈 Monthly')}
            </View>

            {reportPeriod === 'daily' && (
              <View style={styles.reportContent}>
                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Temperature Trend
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.daily.map((r) => r.temp),
                    vitalReadingsHistory.daily.map((r) => r.time),
                    40,
                    colors.warning
                  )}
                </View>

                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Pulse Rate Trend
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.daily.map((r) => r.pulse),
                    vitalReadingsHistory.daily.map((r) => r.time),
                    120,
                    colors.primary
                  )}
                </View>

                <View style={styles.vitalStats}>
                  <Text style={[styles.sectionSubheading, { color: colors.text }]}>
                    Daily Vitals Summary
                  </Text>
                  <View style={styles.statsGrid}>
                    {vitalReadingsHistory.daily.map((reading, idx) => (
                      <View key={idx} style={[styles.statItem, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.statTime, { color: colors.text }]}>
                          {reading.time}
                        </Text>
                        <View style={styles.statDetails}>
                          <Text style={{ color: colors.text }}>🌡️ {reading.temp}°C</Text>
                          <Text style={{ color: colors.text }}>❤️ {reading.pulse} bpm</Text>
                          <Text style={{ color: colors.text }}>🩺 {reading.bp}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {reportPeriod === 'weekly' && (
              <View style={styles.reportContent}>
                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Weekly Avg Temperature
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.weekly.map((r) => r.avgTemp),
                    vitalReadingsHistory.weekly.map((r) => r.day),
                    40,
                    colors.warning
                  )}
                </View>

                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Weekly Avg Pulse Rate
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.weekly.map((r) => r.avgPulse),
                    vitalReadingsHistory.weekly.map((r) => r.day),
                    120,
                    colors.primary
                  )}
                </View>
              </View>
            )}

            {reportPeriod === 'monthly' && (
              <View style={styles.reportContent}>
                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Monthly Avg Temperature
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.monthly.map((r) => r.avgTemp),
                    vitalReadingsHistory.monthly.map((r) => r.week),
                    40,
                    colors.warning
                  )}
                </View>

                <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>
                    Monthly Avg Pulse Rate
                  </Text>
                  {renderChartBars(
                    vitalReadingsHistory.monthly.map((r) => r.avgPulse),
                    vitalReadingsHistory.monthly.map((r) => r.week),
                    120,
                    colors.primary
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Device Uptime Report
            </ThemedText>

            <View style={styles.reportPeriodSelector}>
              {renderPeriodButton('daily', '📅 Daily')}
              {renderPeriodButton('weekly', '📊 Weekly')}
              {renderPeriodButton('monthly', '📈 Monthly')}
            </View>

            <View style={styles.uptimeMetrics}>
              {Object.entries(currentUptimeMetrics).map(([device, uptime]) => {
                return (
                  <View
                    key={device}
                    style={[styles.uptimeItem, { backgroundColor: colors.muted }]}>
                    <View style={styles.uptimeInfo}>
                      <Text style={[styles.uptimeDeviceName, { color: colors.text }]}>
                        {device}
                      </Text>

                      <View style={styles.uptimeBarContainer}>
                        <View
                          style={[styles.uptimeBar, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.uptimeFill,
                              {
                                backgroundColor:
                                  uptime >= thresholds.deviceUptimeWarning
                                    ? colors.success
                                    : colors.warning,
                                width: `${uptime}%`,
                              },
                            ]}
                          />
                        </View>

                        <Text style={[styles.uptimePercentage, { color: colors.text }]}>
                          {uptime}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Overview Statistics
            </ThemedText>

            <View style={styles.analyticsGrid}>
              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Total Patients
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {recentPatients.length}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Registered this session
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Active Alerts
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {activeAlertsCount}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Requiring attention
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Devices Online
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {onlineDevicesCount}/{devices.length}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Connected sensors
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Queue Status
                </Text>
                <Text
                  style={[
                    styles.analyticsValue,
                    {
                      color:
                        queueStatus.toLowerCase() === 'active'
                          ? colors.success
                          : colors.warning,
                    },
                  ]}>
                  {queueStatus}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  System operational
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  pageContent: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  alertsList: { gap: 10 },
  alertItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  alertResolved: { opacity: 0.75 },
  alertContent: { marginBottom: 10 },
  alertType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
  },
  resolveButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resolveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  alertResolvedBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    fontSize: 14,
  },
  reportPeriodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  periodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportContent: {
    gap: 16,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  simpleChart: {
    height: 170,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  chartBarWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 150,
  },
  chartBar: {
    width: '75%',
    borderRadius: 8,
    minHeight: 12,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chartLabelText: {
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
  },
  vitalStats: {
    marginTop: 4,
  },
  sectionSubheading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    gap: 10,
  },
  statItem: {
    borderRadius: 12,
    padding: 12,
  },
  statTime: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  statDetails: {
    gap: 3,
  },
  uptimeMetrics: {
    gap: 12,
  },
  uptimeItem: {
    borderRadius: 12,
    padding: 12,
  },
  uptimeInfo: {},
  uptimeDeviceName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  uptimeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uptimeBar: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  uptimeFill: {
    height: '100%',
    borderRadius: 999,
  },
  uptimePercentage: {
    width: 42,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  analyticsGrid: {
    gap: 12,
  },
  analyticsCard: {
    borderRadius: 12,
    padding: 14,
  },
  analyticsHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  analyticsValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  analyticsSubtitle: {
    fontSize: 12,
  },
});