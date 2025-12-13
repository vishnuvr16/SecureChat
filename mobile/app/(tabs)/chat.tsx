import { LinearGradient } from "expo-linear-gradient";
import { Lock, Shield } from "lucide-react-native";
import { nanoid } from 'nanoid/non-secure';
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import MessageInput from "../../components/MessageInput";
import MessageItem from "../../components/MessageItem";
import * as api from "../../lib/api";
import * as crypto from "../../lib/crypto";
import * as storage from "../../lib/storage";

const { width } = Dimensions.get('window');
type LocalMessage = storage.StoredMessage;

export default function ChatScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const pollRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      await loadLocalMessages();
      startPolling();
      checkOnlineStatus();
    })();

    return () => stopPolling();
  }, []);

  const checkOnlineStatus = () => {
    setOnline(navigator.onLine !== false);
  };

  async function loadLocalMessages() {
    const local = await storage.getMessages();
    local.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    const mk = storage.getMasterKey();
    if (mk) {
      const decrypted = await Promise.all(
        local.map(async (m) => {
          if (!m.text && m.ciphertext && m.iv) {
            try {
              const plain = await crypto.decryptMessage(mk, m.ciphertext, m.iv);
              return { ...m, text: plain };
            } catch (err) {
              console.warn("Decrypt failed for message", m.id, err);
              return m;
            }
          }
          return m;
        }),
      );
      setMessages(decrypted);
    } else {
      setMessages(local);
    }
  }

  function startPolling() {
    if (pollRef.current) return;
    syncCycle().catch(console.error);
    const id = setInterval(() => {
      syncCycle().catch(console.error);
    }, 3000) as unknown as number;
    pollRef.current = id;
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function syncCycle() {
    setSyncing(true);
    try {
      // Push unsynced messages
      const unsynced = await storage.getUnsyncedMessages();
      const mk = storage.getMasterKey();
      for (const msg of unsynced) {
        let ciphertext = msg.ciphertext;
        let iv = msg.iv;
        if (!ciphertext || !iv) {
          if (!mk) throw new Error("No master key for encryption");
          const enc = await crypto.encryptMessage(mk, msg.text);
          ciphertext = enc.ciphertext;
          iv = enc.iv;
        }
        const payload = { ciphertext, iv, sentAt: msg.sentAt };
        try {
          await api.sendMessage(payload);
          await storage.markMessageAsSynced(msg.id);
        } catch (err) {
          console.warn("Failed to send message, will retry later", err);
        }
      }

      // Pull new messages
      const lastSync = await storage.getLastSync();
      const since = lastSync.toISOString();

      const resp = await api.getMessagesSince(since);
      // console.log("Pulled messages", resp);

      if (resp && resp.messages && resp.messages.length > 0) {
        const mk = storage.getMasterKey();
        for (const m of resp.messages) {
          const local = await storage.getMessages();
          // if (local.find((lm) => lm.id === m.id)) continue;
          if (local.find((lm) =>
            lm.ciphertext === m.ciphertext &&
            lm.iv === m.iv &&
            lm.sentAt === m.sentAt
          )) {
            continue;
          }


          let plain = "";
          if (mk) {
            console.log("Decrypting pulled message", mk);
            try {
              plain = await crypto.decryptMessage(mk, m.ciphertext, m.iv);
            } catch (err) {
              console.warn("Failed to decrypt pulled message", m.id, err);
            }
          }

          const newLocalMsg: LocalMessage = {
            id: m.id,
            text: plain,
            ciphertext: m.ciphertext,
            iv: m.iv,
            sentAt: m.sentAt,
            deviceId: m.deviceId,
            synced: true,
          };

          await storage.addMessage(newLocalMsg);
        }

        await storage.setLastSync(new Date());
        await loadLocalMessages();

      }
    } catch (err) {
      console.warn("Sync failed", err);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSend(text: string) {
    if (!text.trim()) return;
    const mk = storage.getMasterKey();
    if (!mk) {
      Alert.alert("Not Ready", "Encryption key not available. Login again or import backup.");
      return;
    }

    const existingMessages = await storage.getMessages();

    const now = new Date();
    const recentDuplicate = existingMessages.find(msg => {
      const timeDiff = Math.abs(new Date(msg.sentAt).getTime() - now.getTime());
      return msg.text === text.trim() && timeDiff < 5000; // 5 seconds window
    });

    if (recentDuplicate) {
      return;
    }

    const sentAt = new Date().toISOString();
    const localId = nanoid();

    let ciphertext = "";
    let iv = "";
    try {
      const enc = await crypto.encryptMessage(mk, text);
      ciphertext = enc.ciphertext;
      iv = enc.iv;
    } catch (err) {
      console.error("Local encrypt failed", err);
      Alert.alert("Encryption failed", "Could not encrypt message locally.");
      return;
    }

    const localMsg: LocalMessage = {
      id: localId,
      text,
      ciphertext,
      iv,
      sentAt,
      deviceId: "mobile",
      synced: false,
    };

    await storage.addMessage(localMsg);
    await loadLocalMessages();

    try {
      await api.sendMessage({ ciphertext, iv, sentAt });
      await storage.markMessageAsSynced(localId);
      await loadLocalMessages();
    } catch (err) {
      console.warn("Send failed, will retry in background", err);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await syncCycle();
    } catch (err) {
      console.warn(err);
    }
    setRefreshing(false);
  }

  return (
    <LinearGradient
      colors={['#111827', '#1f2937', '#111827']}
      style={styles.container}
    >

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageItem item={item} />}
        keyExtractor={(i) => i.id}
        inverted={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.emptyMessagesContainer
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Lock size={48} color="#4b5563" />
            </View>
            <Text style={styles.emptyTitle}>Your Secure Chat</Text>
            <Text style={styles.emptyText}>
              Start an end-to-end encrypted conversation. 
              Your messages are secured with military-grade encryption.
            </Text>
            <View style={styles.emptyFeatures}>
              {['End-to-end encrypted', 'No server storage', 'Private by design'].map((feature, idx) => (
                <View key={idx} style={styles.featureBadge}>
                  <Shield size={14} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        }
      />

      {/* Message Input */}
      <MessageInput onSend={handleSend} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.7)',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  emptyMessagesContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  featureText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});