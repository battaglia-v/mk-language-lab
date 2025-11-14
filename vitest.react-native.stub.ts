export const View = () => null;
export const Text = () => null;
export const ScrollView = View;
export const SafeAreaView = View;
export const StyleSheet = {
  create: () => ({}),
};
export const Platform = {
  OS: 'web',
};

const ReactNativeStub = {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
};

export default ReactNativeStub;
