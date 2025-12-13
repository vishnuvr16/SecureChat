import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Bell, CheckCircle, Database, Lock, QrCode, Shield, Smartphone, Zap } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginIndex() {
  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.glow} />
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.2)', 'transparent']}
              style={styles.headerGradient}
            />
          </View>
          
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.logo}
            >
              <Shield size={40} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>SecureChat</Text>
            <Text style={styles.tagline}>Military-grade encryption • Your data stays with you</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
              style={StyleSheet.absoluteFillObject}
              // borderRadius={24}
            />
            
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIcon}>
                <Smartphone size={32} color="#6366f1" />
              </View>
              
              <Text style={styles.welcomeTitle}>Continue on Mobile</Text>
              <Text style={styles.welcomeDescription}>
                Scan QR code from SecureChat web to sync your encrypted chats across devices
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push("/(auth)/scan")}
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <QrCode size={24} color="white" />
                  <Text style={styles.primaryButtonText}>Scan QR Code</Text>
                  <ArrowRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why SecureChat?</Text>
            
            <View style={styles.featuresGrid}>
              {/* Feature 1 */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Lock size={24} color="#6366f1" />
                </View>
                <Text style={styles.featureTitle}>End-to-End Encrypted</Text>
                <Text style={styles.featureDescription}>
                  Messages encrypted on device, only you can read them
                </Text>
              </View>

              {/* Feature 2 */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Database size={24} color="#10b981" />
                </View>
                <Text style={styles.featureTitle}>Local Storage</Text>
                <Text style={styles.featureDescription}>
                  Your data never leaves your device, complete privacy
                </Text>
              </View>

              {/* Feature 3 */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Zap size={24} color="#f59e0b" />
                </View>
                <Text style={styles.featureTitle}>Lightning Fast</Text>
                <Text style={styles.featureDescription}>
                  Instant message delivery with minimal data usage
                </Text>
              </View>

              {/* Feature 4 */}
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                  <Bell size={24} color="#8b5cf6" />
                </View>
                <Text style={styles.featureTitle}>No Tracking</Text>
                <Text style={styles.featureDescription}>
                  We don't track you, no ads, no data collection
                </Text>
              </View>
            </View>
          </View>

          {/* Security Features */}
          <View style={styles.securitySection}>
            <Text style={styles.sectionTitle}>Security Features</Text>
            
            <View style={styles.securityList}>
              <View style={styles.securityItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.securityText}>AES-256 Encryption</Text>
              </View>
              <View style={styles.securityItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.securityText}>Zero-knowledge Architecture</Text>
              </View>
              <View style={styles.securityItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.securityText}>Local-only Storage</Text>
              </View>
              <View style={styles.securityItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.securityText}>No Cloud Backups</Text>
              </View>
              <View style={styles.securityItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.securityText}>Open-source Protocol</Text>
              </View>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <View style={styles.footerBadge}>
              <Shield size={16} color="#10b981" />
              <Text style={styles.footerBadgeText}>100% Private</Text>
            </View>
            
            <Text style={styles.footerTitle}>Your Privacy Matters</Text>
            <Text style={styles.footerDescription}>
              SecureChat gives you complete control over your data. 
              Everything is encrypted locally on your device before it goes anywhere.
            </Text>
            
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>SecureChat v1.0</Text>
              <Text style={styles.versionSubtext}>End-to-end encrypted messaging</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 150,
    transform: [{ translateX: -150 }],
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    gap: 32,
  },
  welcomeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeContent: {
    padding: 28,
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  securitySection: {
    gap: 16,
  },
  securityList: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  securityText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
  },
  actionsSection: {
    gap: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  footer: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  footerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  footerDescription: {
    fontSize: 15,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
});