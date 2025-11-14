import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { brandColors, brandNames, semanticColors, spacingScale } from '@mk/tokens';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithCredentials, signInWithBrowser, isWorking, error, clearError, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleBrowserSignIn = async () => {
    clearError();
    setSubmitError(null);
    const result = await signInWithBrowser();
    if (result.ok) {
      router.replace('/(tabs)/home');
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setSubmitError('Please enter your email and password.');
      return;
    }
    clearError();
    setSubmitError(null);
    const result = await signInWithCredentials({ email, password });
    if (result.ok) {
      router.replace('/(tabs)/home');
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Continue with the secure browser flow (Google, Facebook, or password) or sign in directly with your {brandNames.full} credentials.
          </Text>
          <Pressable
            style={[styles.button, styles.browserButton, isWorking && styles.buttonDisabled]}
            onPress={() => {
              void handleBrowserSignIn();
            }}
            disabled={isWorking}
          >
            <Text style={[styles.buttonText, styles.browserButtonText]}>
              {isWorking ? 'Opening secure browser…' : 'Continue with browser'}
            </Text>
          </Pressable>
          <Text style={styles.helperText}>
            A secure browser window opens so you can complete NextAuth sign-in (Google, Facebook, or email) and return automatically.
          </Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or use email/password</Text>
            <View style={styles.dividerLine} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!isWorking}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isWorking}
          />
          {(submitError ?? error) && <Text style={styles.errorText}>{submitError ?? error}</Text>}
          <Pressable style={[styles.button, isWorking && styles.buttonDisabled]} onPress={handleSubmit} disabled={isWorking}>
            <Text style={styles.buttonText}>{isWorking ? 'Signing in…' : 'Continue'}</Text>
          </Pressable>
          <Text style={styles.helperText}>
            Status: {status === 'authenticated' ? 'Signed in' : 'Signed out'} · Need help? Update your password on web first.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandColors.creamLight,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacingScale['2xl'],
    gap: spacingScale.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: brandColors.navy,
  },
  subtitle: {
    fontSize: 16,
    color: semanticColors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.2)',
    borderRadius: 12,
    paddingHorizontal: spacingScale.md,
    paddingVertical: spacingScale.sm,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: brandColors.red,
    paddingVertical: spacingScale.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  browserButton: {
    backgroundColor: brandColors.navy,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: brandColors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  browserButtonText: {
    color: brandColors.cream,
  },
  errorText: {
    color: brandColors.red,
  },
  helperText: {
    fontSize: 12,
    color: semanticColors.textMuted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(16,24,40,0.1)',
  },
  dividerLabel: {
    fontSize: 12,
    color: semanticColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
