import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#111827', '#1f2937', '#374151']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.stackContent,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  stackContent: {
    backgroundColor: 'transparent',
  },
});