import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import {
  ChevronLeft,
  Mail,
  Lock,
  Trash2,
  FileText,
  Shield,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { useAuthStore } from '../store/auth';
import { clearAllExceptAuth } from '../lib/storage';

const APP_VERSION = Constants.expoConfig?.version ?? '2.0.0';
const WEB_BASE = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://mk-language-lab.vercel.app';

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const [isClearing, setIsClearing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = async () => {
    await WebBrowser.openBrowserAsync(`${WEB_BASE}/en/forgot-password`);
  };

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally stored data except your login. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllExceptAuth();
              Alert.alert('Done', 'Cache cleared successfully');
            } catch (error) {
              console.error('[Settings] Clear cache failed:', error);
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, []);

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync(`${WEB_BASE}/en/privacy`);
  };

  const handleTermsOfService = async () => {
    await WebBrowser.openBrowserAsync(`${WEB_BASE}/en/terms`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#f7f8fb" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Mail size={20} color="rgba(247,248,251,0.6)" />}
              label="Email"
              value={user?.email ?? 'Not signed in'}
            />
            <SettingsRow
              icon={<Lock size={20} color="rgba(247,248,251,0.6)" />}
              label="Change Password"
              onPress={handleChangePassword}
              showArrow
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Info size={20} color="rgba(247,248,251,0.6)" />}
              label="Version"
              value={APP_VERSION}
            />
            <SettingsRow
              icon={<Trash2 size={20} color="#ef4444" />}
              label="Clear Cache"
              onPress={handleClearCache}
              destructive
              disabled={isClearing}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Shield size={20} color="rgba(247,248,251,0.6)" />}
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
              showArrow
            />
            <SettingsRow
              icon={<FileText size={20} color="rgba(247,248,251,0.6)" />}
              label="Terms of Service"
              onPress={handleTermsOfService}
              showArrow
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow,
  destructive,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && <ExternalLink size={16} color="rgba(247,248,251,0.4)" />}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0b0b12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222536',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  placeholder: {
    width: 44,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#f7f8fb',
  },
  rowLabelDestructive: {
    color: '#ef4444',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.5)',
  },
});
