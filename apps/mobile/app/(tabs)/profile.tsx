import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.72)',
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: 'rgba(255,120,120,0.2)',
    borderWidth: 1,
    borderColor: '#ff7878',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  signOutText: {
    color: '#ff7878',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
