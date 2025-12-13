import { getUser } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { MessageSquare, Settings, Shield, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getUser();
      setIsLoggedIn(!!user);
      
      if (!user) {
        // Redirect to auth if not logged in
        setTimeout(() => {
          router.replace('/(auth)');
        }, 100);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setTimeout(() => {
        router.replace('/(auth)');
      }, 100);
    }
  };

  // Show nothing while checking auth
  if (isLoggedIn === null) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }} />
    );
  }

  // Redirect to auth if not logged in
  if (!isLoggedIn) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarLabelStyle: styles.tabLabel,
          headerStyle: styles.header,
          headerTintColor: '#ffffff',
          headerTitleStyle: styles.headerTitle,
          tabBarBackground: () => (
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <MessageSquare size={size - 2} color={focused ? '#3b82f6' : color} />
              </View>
            ),
            headerTitle: 'SecureChat',
            headerLeft: () => (
              <View style={styles.headerLeft}>
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  style={styles.shieldContainer}
                >
                  <Shield size={20} color="white" />
                </LinearGradient>
              </View>
            ),
            headerRight: () => (
              <View style={styles.headerRight}>
                <View style={styles.encryptionBadge}>
                  <Shield size={14} color="#10b981" />
                  <Text style={styles.encryptionText}>Encrypted</Text>
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Settings size={size - 2} color={focused ? '#3b82f6' : color} />
              </View>
            ),
            headerTitle: 'Settings',
            headerRight: () => (
              <View style={styles.headerRight}>
                <Text style={styles.versionText}><Settings color="white"/></Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <User size={size - 2} color={focused ? '#3b82f6' : color} />
              </View>
            ),
            headerTitle: 'Profile',
            headerRight: () => (
              <View style={styles.headerRight}>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>SECURED</Text>
                </View>
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    paddingBottom: 0,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerLeft: {
    marginLeft: 20,
  },
  headerRight: {
    marginRight: 20,
  },
  shieldContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
  },
  encryptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 1,
  },
});