/**
 * Learn Components
 * 
 * Components for the lesson and learning experience.
 * Includes both legacy components and new enhanced components from the lesson overhaul.
 */

// ============================================================================
// New Enhanced Components (Lesson Overhaul)
// ============================================================================

export { DialogueViewer } from './DialogueViewer';
export { EnhancedVocabularyCard } from './EnhancedVocabularyCard';
export { ConjugationTable } from './ConjugationTable';
export { default as LessonPageContentV2 } from './LessonPageContentV2';

// Exercise Components
export { PictureMatchExercise, CountryDragDrop } from './exercises';

// ============================================================================
// Legacy Components (Still in use)
// ============================================================================

export { default as LessonContent } from './LessonContent';
export { default as VocabularySection } from './VocabularySection';
export { default as GrammarSection } from './GrammarSection';
export { default as ExerciseSection } from './ExerciseSection';

