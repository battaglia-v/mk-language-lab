import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Lock, Play, BookOpen } from 'lucide-react-native';
import type { LessonNode } from '../lib/curriculum';

interface LessonCardProps {
  node: LessonNode;
  onPress: () => void;
}

export function LessonCard({ node, onPress }: LessonCardProps) {
  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed';
  const isAvailable = node.status === 'available' || node.status === 'in_progress';

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      disabled={isLocked}
    >
      <View style={[styles.iconContainer, isCompleted && styles.iconCompleted]}>
        {isLocked ? (
          <Lock size={20} color="#666" />
        ) : isCompleted ? (
          <Check size={20} color="#000" />
        ) : (
          <BookOpen size={20} color="#f6d83b" />
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isLocked && styles.titleLocked]}>
          {node.title}
        </Text>
        {node.description && (
          <Text style={styles.description} numberOfLines={1}>
            {node.description}
          </Text>
        )}
      </View>
      {isAvailable && (
        <View style={styles.playButton}>
          <Play size={16} color="#f6d83b" fill="#f6d83b" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111424',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCompleted: {
    backgroundColor: '#f6d83b',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  titleLocked: {
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 2,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(246,216,59,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
