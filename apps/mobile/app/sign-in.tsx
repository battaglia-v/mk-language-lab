import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useGoogleAuth } from '../lib/google-auth';
import { KeyboardSafeView } from '../components/ui/KeyboardSafeView';
import { useRedirectIfAuth } from '../hooks/useAuthGuard';
import { trackSignInInitiated, trackSignInSuccess, trackSignInFailed } from '../lib/analytics';

export default function SignInScreen() {
  // Redirect to home if already authenticated
  useRedirectIfAuth('/(tabs)');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signInWithGoogle, error, clearError } = useAuthStore();
  
  // Use native Google Sign-In
  const { signIn: googleSignIn, isSigningIn: isGoogleLoading, isConfigured } = useGoogleAuth();

  const handleGooglePress = useCallback(async () => {
    if (!isConfigured) {
      console.warn('[GoogleAuth] Not configured');
      return;
    }

    clearError();
    trackSignInInitiated({ method: 'google' });

    const result = await googleSignIn();

    if (result.type === 'success' && result.idToken) {
      try {
        await signInWithGoogle(result.idToken);
        trackSignInSuccess({ method: 'google' });
        router.replace('/(tabs)');
      } catch (err) {
        trackSignInFailed({ method: 'google', error: err instanceof Error ? err.message : 'Unknown error' });
      }
    } else if (result.type === 'error') {
      trackSignInFailed({ method: 'google', error: result.error?.message || 'Unknown error' });
    }
    // 'cancel' type - user cancelled, do nothing
  }, [isConfigured, googleSignIn, signInWithGoogle, clearError]);

  const handleSignIn = async () => {
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    clearError();
    trackSignInInitiated({ method: 'credentials' });

    try {
      await signIn(email, password);
      trackSignInSuccess({ method: 'credentials' });
      router.replace('/(tabs)');
    } catch (err) {
      trackSignInFailed({ method: 'credentials', error: err instanceof Error ? err.message : 'Unknown error' });
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardSafeView>
      <View style={styles.container}>
        <View style={styles.content}>
        <Text style={styles.title}>MK Language Lab</Text>
        <Text style={styles.subtitle}>Learn Macedonian</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid') ? (
              <TouchableOpacity
                style={styles.resetLink}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.resetLinkText}>Forgot your password? Reset it here</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, (isGoogleLoading || !isConfigured) && styles.buttonDisabled]}
          onPress={handleGooglePress}
          disabled={isGoogleLoading || !isConfigured}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#f7f8fb" />
          ) : (
            <Text style={styles.googleButtonText}>
              {isConfigured ? 'Continue with Google' : 'Google sign-in unavailable'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.links}>
          <Link href="/register" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.linkAccent}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>
        </View>
      </View>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.72)',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,120,120,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff7878',
    textAlign: 'center',
  },
  resetLink: {
    marginTop: 8,
  },
  resetLinkText: {
    color: '#f6d83b',
    textAlign: 'center',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
    color: '#f7f8fb',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222536',
  },
  dividerText: {
    color: 'rgba(247,248,251,0.5)',
    marginHorizontal: 16,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#222536',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#f7f8fb',
    fontSize: 16,
    fontWeight: '600',
  },
  links: {
    marginTop: 24,
    gap: 12,
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    color: 'rgba(247,248,251,0.72)',
    textAlign: 'center',
  },
  linkAccent: {
    color: '#f6d83b',
  },
});
