import { Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


export default function MessageInput({ onSend }: { onSend: (text: string) => Promise<void> | void }) {
  const [text, setText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(44);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const send = async () => {
    if (!text.trim()) return;
    Keyboard.dismiss();
    await onSend(text.trim());
    setText("");
    setInputHeight(44);
  };

  const handleInputSizeChange = (event: any) => {
    const height = Math.min(Math.max(44, event.nativeEvent.contentSize.height), 100);
    setInputHeight(height);
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={[styles.container, { paddingBottom: keyboardHeight > 0 ? keyboardHeight-40 : 12 }]}
      >
        <View style={styles.inputWrapper}>

          {/* Input Field */}
          <TextInput
            ref={textInputRef}
            value={text}
            onChangeText={setText}
            onContentSizeChange={handleInputSizeChange}
            placeholder="Type a secure message…"
            placeholderTextColor="#94a3b8"
            style={[styles.input, { height: inputHeight }]}
            multiline
            maxLength={500}
            returnKeyType="default"
            blurOnSubmit={false}
            onSubmitEditing={() => {}}
          />

          {/* Send Button */}
          <TouchableOpacity 
            onPress={send}
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            disabled={!text.trim()}
          >
            <Send size={22} color={text.trim() ? "white" : "#64748b"} />
          </TouchableOpacity>
        </View>

        {/* Character Counter */}
        {/* {text.length > 0 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {text.length}/500
            </Text>
          </View>
        )} */}
      </KeyboardAvoidingView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  // counterContainer: {
  //   alignItems: 'flex-end',
  //   marginTop: 4,
  //   marginRight: 8,
  //   marginBottom: 4,
  // },
  // counterText: {
  //   fontSize: 11,
  //   color: '#64748b',
  //   fontWeight: '500',
  // },
});
