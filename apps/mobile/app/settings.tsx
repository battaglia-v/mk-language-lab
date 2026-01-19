import { useState, useCallback, useEffect } from 'react';
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
  ChevronRight,
  Mail,
  Lock,
  Trash2,
  FileText,
  Shield,
  Info,
  ExternalLink,
  User,
  Sun,
  Moon,
  Smartphone,
  LogOut,
  HelpCircle,
} from 'lucide-react-native';
import { useAuthStore } from '../store/auth';
import { clearAllExceptAuth } from '../lib/storage';
import { getTheme, setTheme, type ThemeMode } from '../lib/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '2.0.0';
const WEB_BASE = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://mk-language-lab.vercel.app';

export default function SettingsScreen() {
  const { user, signOut, isAuthenticated } = useAuthStore();
  const [isClearing, setIsClearing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = async () => {
    await WebBrowser.openBrowserAsync(`${WEB_BASE}/en/forgot-password`);
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    setCurrentTheme(mode);
    await setTheme(mode);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
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

  const handleHelp = () => {
    router.push('/help');
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

        {/* Profile Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.sectionContent}>
              <SettingsRow
                icon={<User size={20} color="#f6d83b" />}
                label="View Profile"
                value={user?.name ?? 'Your profile'}
                onPress={handleProfilePress}
                showChevron
              />
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<Mail size={20} color="rgba(247,248,251,0.6)" />}
              label="Email"
              value={user?.email ?? 'Not signed in'}
            />
            {isAuthenticated && (
              <>
                <SettingsRow
                  icon={<Lock size={20} color="rgba(247,248,251,0.6)" />}
                  label="Change Password"
                  onPress={handleChangePassword}
                  showArrow
                />
                <SettingsRow
                  icon={<LogOut size={20} color="#ef4444" />}
                  label="Sign Out"
                  onPress={handleSignOut}
                  destructive
                />
              </>
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            <View style={styles.themeSelector}>
              <ThemeOption
                icon={<Smartphone size={18} color={currentTheme === 'system' ? '#f6d83b' : 'rgba(247,248,251,0.5)'} />}
                label="System"
                isActive={currentTheme === 'system'}
                onPress={() => handleThemeChange('system')}
              />
              <ThemeOption
                icon={<Sun size={18} color={currentTheme === 'light' ? '#f6d83b' : 'rgba(247,248,251,0.5)'} />}
                label="Light"
                isActive={currentTheme === 'light'}
                onPress={() => handleThemeChange('light')}
              />
              <ThemeOption
                icon={<Moon size={18} color={currentTheme === 'dark' ? '#f6d83b' : 'rgba(247,248,251,0.5)'} />}
                label="Dark"
                isActive={currentTheme === 'dark'}
                onPress={() => handleThemeChange('dark')}
              />
            </View>
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

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon={<HelpCircle size={20} color="#f6d83b" />}
              label="Help & FAQ"
              onPress={handleHelp}
              showChevron
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
  showChevron,
  destructive,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showChevron?: boolean;
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
        {showChevron && <ChevronRight size={16} color="rgba(247,248,251,0.4)" />}
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

function ThemeOption({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.themeOption, isActive && styles.themeOptionActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.themeOptionLabel, isActive && styles.themeOptionLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
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
  themeSelector: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(247,248,251,0.05)',
    gap: 6,
  },
  themeOptionActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.5)',
  },
  themeOptionLabelActive: {
    color: '#f6d83b',
  },
});
