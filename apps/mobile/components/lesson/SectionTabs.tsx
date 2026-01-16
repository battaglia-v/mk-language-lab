import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageSquare, BookOpen, GraduationCap, Dumbbell } from 'lucide-react-native';
import type { SectionType } from '../../lib/lesson';

interface SectionTabsProps {
  sections: SectionType[];
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const SECTION_CONFIG: Record<SectionType, { icon: typeof MessageSquare; label: string }> = {
  dialogue: { icon: MessageSquare, label: 'Dialogue' },
  vocabulary: { icon: BookOpen, label: 'Vocab' },
  grammar: { icon: GraduationCap, label: 'Grammar' },
  practice: { icon: Dumbbell, label: 'Practice' },
};

export function SectionTabs({ sections, activeSection, onSectionChange }: SectionTabsProps) {
  return (
    <View style={styles.container}>
      {sections.map((section) => {
        const config = SECTION_CONFIG[section];
        const Icon = config.icon;
        const isActive = section === activeSection;

        return (
          <TouchableOpacity
            key={section}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSectionChange(section)}
          >
            <Icon size={20} color={isActive ? '#f6d83b' : 'rgba(247,248,251,0.5)'} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0b0b12',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f6d83b',
  },
  label: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 4,
  },
  labelActive: {
    color: '#f6d83b',
  },
});
