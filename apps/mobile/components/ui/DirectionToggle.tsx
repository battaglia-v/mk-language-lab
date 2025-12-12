/**
 * DirectionToggle Component
 *
 * A reusable component for selecting translation/practice direction.
 * Used across Practice, Reader, and Translator screens.
 *
 * @example
 * // Practice screen (default options)
 * <DirectionToggle
 *   direction={direction}
 *   onDirectionChange={setDirection}
 * />
 *
 * @example
 * // Reader screen (custom options)
 * <DirectionToggle
 *   direction={directionId}
 *   onDirectionChange={setDirectionId}
 *   options={[
 *     { id: 'en-mk', label: 'EN → MK' },
 *     { id: 'mk-en', label: 'MK → EN' },
 *   ]}
 * />
 */

import { View, StyleSheet } from 'react-native';
import { NativeButton, NativeTypography } from '@mk/ui';
import { spacingScale } from '@mk/tokens';

/** Default direction type for practice screens */
export type PracticeDirection = 'enToMk' | 'mkToEn';

export interface DirectionOption<T extends string = string> {
  id: T;
  label: string;
  shortLabel?: string;
}

const DEFAULT_OPTIONS: DirectionOption<PracticeDirection>[] = [
  { id: 'enToMk', label: 'EN → MK', shortLabel: 'EN→MK' },
  { id: 'mkToEn', label: 'MK → EN', shortLabel: 'MK→EN' },
];

export interface DirectionToggleProps<T extends string = PracticeDirection> {
  /** Current selected direction */
  direction: T;
  /** Callback when direction changes */
  onDirectionChange: (direction: T) => void;
  /** Custom direction options (defaults to EN⇄MK) */
  options?: DirectionOption<T>[];
  /** Layout variant */
  variant?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Test ID prefix for testing */
  testID?: string;
}

export function DirectionToggle<T extends string = PracticeDirection>({
  direction,
  onDirectionChange,
  options = DEFAULT_OPTIONS as DirectionOption<T>[],
  variant = 'horizontal',
  size = 'medium',
  disabled = false,
  testID = 'direction-toggle',
}: DirectionToggleProps<T>) {
  const containerStyle = [
    styles.container,
    variant === 'vertical' && styles.containerVertical,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      {options.map((option) => {
        const isSelected = direction === option.id;
        return (
          <NativeButton
            key={option.id}
            variant={isSelected ? 'primary' : 'secondary'}
            style={[
              styles.button,
              size === 'small' && styles.buttonSmall,
              size === 'large' && styles.buttonLarge,
              variant === 'vertical' && styles.buttonVertical,
            ]}
            onPress={() => onDirectionChange(option.id)}
            disabled={disabled}
            testID={`${testID}-${option.id}`}
          >
            <NativeTypography
              variant={size === 'small' ? 'caption' : 'body'}
              style={[
                styles.buttonText,
                isSelected && styles.buttonTextSelected,
              ]}
            >
              {size === 'small' ? option.shortLabel || option.label : option.label}
            </NativeTypography>
          </NativeButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacingScale.sm,
  },
  containerVertical: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    minWidth: 80,
  },
  buttonSmall: {
    paddingVertical: spacingScale.xs,
    paddingHorizontal: spacingScale.sm,
  },
  buttonLarge: {
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.lg,
  },
  buttonVertical: {
    flex: 0,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
  },
  buttonTextSelected: {
    fontWeight: '600',
  },
});

export default DirectionToggle;
