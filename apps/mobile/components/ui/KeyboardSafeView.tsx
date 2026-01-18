import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  children: ReactNode;
  /** Additional offset for headers or other fixed elements */
  keyboardVerticalOffset?: number;
};

/**
 * Standardized keyboard avoidance wrapper for form screens.
 * 
 * Parity checklist:
 * - [x] Keyboard opens correctly
 * - [x] Focus behavior identical (iOS/Android)
 * - [x] No blocked inputs
 * 
 * @see PARITY_CHECKLIST.md#forms
 */
export function KeyboardSafeView({ children, keyboardVerticalOffset = 0 }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : keyboardVerticalOffset + 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.inner}>{children}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
