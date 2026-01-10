// Reader Components
// Re-export all reader components for easy importing

export { DifficultyBadge, getDifficultyConfig, estimateDifficulty } from './DifficultyBadge';
export { WordDetailPopup } from './WordDetailPopup';
export { ReaderWorkspace } from './ReaderWorkspace';
export { TextImporter } from './TextImporter';
export { WordByWordDisplay } from './WordByWordDisplay';
export { QuickAnalyzeButton } from './QuickAnalyzeButton';

// Reader v2 Components
export { ReaderV2Layout, useReaderV2 } from './ReaderV2Layout';
export type { SavedWord } from './ReaderV2Layout';
export { TappableTextV2 } from './TappableTextV2';
export { WordBottomSheet } from './WordBottomSheet';
export type { WordInfo } from './WordBottomSheet';
export { GlossaryDrawer } from './GlossaryDrawer';
