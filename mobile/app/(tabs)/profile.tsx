import { clearAll, getUser } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ArrowUpRight,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    HelpCircle,
    Key,
    Lock,
    LogOut,
    Mail,
    Shield,
    Smartphone,
    User as UserIcon,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type UserData = {
  username: string;
  email: string;
  createdAt?: string;
  devices?: number;
  securityScore?: number;
};

type AccordionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  color: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await getUser();
      if (storedUser) {
        setUser({
          username: storedUser.email.split('@')[0] || 'Anonymous',
          email: storedUser.email || 'user@example.com',
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearAll();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'encryption',
      title: 'How Encryption Works',
      icon: <Lock size={22} color="#3b82f6" />,
      color: '#3b82f6',
      content: `SecureChat uses end-to-end encryption to protect your messages. This means:
      
• Messages are encrypted on your device before sending
• Only the intended recipient can decrypt and read them
• We never have access to your unencrypted messages
• Your encryption keys are stored only on your device
• All messages are secured with military-grade AES-256 encryption`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Shield size={22} color="#10b981" />,
      color: '#10b981',
      content: `Your privacy is our top priority:
      
• We collect minimal data necessary for the app to function
• Your messages are never stored on our servers
• We don't track your activity or reading habits
• All data is processed locally on your device
• You can export and delete all your data at any time`
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: <FileText size={22} color="#8b5cf6" />,
      color: '#8b5cf6',
      content: `By using SecureChat, you agree to:
      
• Use the service for legal purposes only
• Not attempt to compromise the encryption
• Keep your login credentials secure
• Accept that we cannot recover lost encryption keys
• Understand that messages are permanently deleted when you logout`
    },
    {
      id: 'support',
      title: 'Support & Help',
      icon: <HelpCircle size={22} color="#f59e0b" />,
      color: '#f59e0b',
      content: `Need help with SecureChat?
      
• Common Issues:
  - Messages not syncing: Check internet connection
  - Can't login: Ensure correct credentials
  - App crashing: Try restarting the app
  
• Backup Your Data:
  - Regular backups prevent data loss
  - Export chats from Settings screen
  - Store backups in a secure location
  
• Contact Support:
  - Email: support@securechat.com
  - Response time: 24-48 hours`
    },
  ];

  const StatCard = ({ label, value, icon, color, trend }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.trendBadge}>
          <ArrowUpRight size={12} color="#10b981" />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
  );

  const ProfileSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ProfileItem = ({ icon, label, value, action, onPress, type = 'info' }: any) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileIcon}>
          {icon}
        </View>
        <View>
          <Text style={styles.profileLabel}>{label}</Text>
          <Text style={styles.profileValue}>{value}</Text>
        </View>
      </View>
      {type === 'action' && (
        <ChevronRight size={20} color="#64748b" />
      )}
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </TouchableOpacity>
  );

  const Accordion = ({ item }: { item: AccordionItem }) => {
    const isExpanded = expandedAccordion === item.id;

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setExpandedAccordion(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.accordionIcon, { backgroundColor: `${item.color}15` }]}>
            {item.icon}
          </View>
          <Text style={styles.accordionTitle}>{item.title}</Text>
          <ChevronDown 
            size={20} 
            color="#94a3b8" 
            style={[styles.accordionArrow, isExpanded && styles.accordionArrowExpanded]} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionText}>
              {item.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const generateAvatar = (username: string) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
    ];
    const color = colors[username.length % colors.length];
    const initials = username.charAt(0).toUpperCase();
    return { color, initials };
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingAvatar}>
            <UserIcon size={40} color="#94a3b8" />
          </View>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  const avatar = user ? generateAvatar(user.username) : { color: '#6366f1', initials: 'U' };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.2)', 'transparent']}
            style={styles.headerGradient}
          />
          
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[avatar.color, `${avatar.color}80`]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{avatar.initials}</Text>
              </LinearGradient>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>
                  {user?.username || 'Anonymous User'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <CheckCircle size={16} color="#10b981" />
                </View>
              </View>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              
              <View style={styles.memberSince}>
                <Calendar size={14} color="#94a3b8" />
                <Text style={styles.memberSinceText}>
                  Member since 2024
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              label="Security Score"
              value="100"
              icon={<Shield size={20} color="#10b981" />}
              color="#10b981"
              trend="Perfect"
            />
            <StatCard
              label="Devices"
              value="1"
              icon={<Smartphone size={20} color="#6366f1" />}
              color="#6366f6"
            />
            <StatCard
              label="Encryption"
              value="Active"
              icon={<Lock size={20} color="#8b5cf6" />}
              color="#8b5cf6"
              trend="✓"
            />
          </View>
        </View>

        {/* Account Section */}
        <ProfileSection title="ACCOUNT">
          <ProfileItem
            icon={<Mail size={22} color="#3b82f6" />}
            label="Email Address"
            value={user?.email || 'Not set'}
            type="info"
          />
          <ProfileItem
            icon={<Key size={22} color="#f59e0b" />}
            label="Account Status"
            value="Active"
            type="info"
          />
          <ProfileItem
            icon={<Shield size={22} color="#10b981" />}
            label="Encryption"
            value="End-to-end"
            type="info"
          />
        </ProfileSection>

        {/* Information Accordion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATION</Text>
          <View style={styles.accordionSection}>
            {accordionItems.map((item) => (
              <Accordion key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
            style={styles.logoutButtonInner}
          >
            <LogOut size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SecureChat v1.0</Text>
          <Text style={styles.buildText}>End-to-end Encrypted • Your Data Stays Yours</Text>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.modalCard}
            >
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowLogoutModal(false)}
              >
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>

              <View style={styles.modalIcon}>
                <LogOut size={48} color="#ef4444" />
              </View>

              <Text style={styles.modalTitle}>Logout from SecureChat?</Text>
              <Text style={styles.modalMessage}>
                Your encrypted messages will remain secure on this device. 
                You'll need to login again to access them.
              </Text>

              <View style={styles.modalNote}>
                <Shield size={16} color="#94a3b8" />
                <Text style={styles.modalNoteText}>
                  All data is end-to-end encrypted and stored locally.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.confirmButtonGradient}
                  >
                    <LogOut size={18} color="white" />
                    <Text style={styles.confirmButtonText}>Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 20,
  },
  loadingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 8,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberSinceText: {
    fontSize: 13,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  trendBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  accordionSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 18,
  },
  accordionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  accordionArrow: {
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  accordionArrowExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accordionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accordionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 14,
    color: '#94a3b8',
  },
  actionContainer: {},
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 60,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  buildText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    borderRadius: 28,
    overflow: 'hidden',
    padding: 32,
  },
  modalClose: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 1,
    padding: 8,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  modalNoteText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    paddingVertical: 18,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  confirmButton: {},
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});