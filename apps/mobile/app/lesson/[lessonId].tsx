import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lesson</Text>
        <View style={styles.backButton} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Lesson: {lessonId}</Text>
        <Text style={styles.subtitle}>
          Lesson runner coming in 62-02
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.72)',
    textAlign: 'center',
  },
});
