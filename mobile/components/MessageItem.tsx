// components/MessageItem.tsx
import { Check, CheckCheck, Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StoredMessage } from "../lib/storage";

export default function MessageItem({ item }: { item: StoredMessage }) {
  const isLocal = item.deviceId === "mobile";
  const time = new Date(item.sentAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={[styles.messageContainer, isLocal ? styles.outgoingContainer : styles.incomingContainer]}>
      <View style={[
        styles.messageBubble,
        isLocal ? styles.outgoingBubble : styles.incomingBubble
      ]}>
        <Text style={[
          styles.messageText,
          isLocal ? styles.outgoingText : styles.incomingText
        ]}>
          {item.text || "🔒 encrypted"}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[
            styles.timeText,
            isLocal ? styles.outgoingTime : styles.incomingTime
          ]}>
            {time}
          </Text>
          
          {isLocal && (
            <View style={styles.statusIcon}>
              {item.synced ? (
                <CheckCheck size={14} color={isLocal ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"} />
              ) : (
                <Check size={14} color={isLocal ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"} />
              )}
            </View>
          )}
        </View>
      </View>
      
      {!item.synced && (
        <View style={styles.syncIndicator}>
          <Clock size={12} color="#f59e0b" />
          <Text style={styles.syncText}>Syncing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
    maxWidth: "80%",
  },
  outgoingContainer: {
    alignSelf: "flex-end",
  },
  incomingContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4, // For incoming
    borderBottomRightRadius: 4, // For outgoing
  },
  outgoingBubble: {
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: 18,
  },
  incomingBubble: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  outgoingText: {
    color: "#ffffff",
  },
  incomingText: {
    color: "#e2e8f0",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.8,
  },
  outgoingTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  incomingTime: {
    color: "rgba(226, 232, 240, 0.7)",
  },
  statusIcon: {
    marginLeft: 2,
  },
  syncIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    // marginLeft: isLocal ? "auto" : 0,
    // marginRight: isLocal ? 0 : "auto",
  },
  syncText: {
    fontSize: 10,
    color: "#f59e0b",
    fontWeight: "500",
  },
});