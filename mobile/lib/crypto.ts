import CryptoJS from "react-native-crypto-js";

const PBKDF2_ITERATIONS = 100000;

// Convert ArrayBuffer → WordArray
function arrayBufferToWordArray(ab: ArrayBuffer) {
  const u8 = new Uint8Array(ab);
  const words:any = [];
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] |= u8[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

// Convert WordArray → ArrayBuffer
function wordArrayToArrayBuffer(wordArray: any): ArrayBuffer {
  const { words, sigBytes } = wordArray;
  const ab = new ArrayBuffer(sigBytes);
  const u8 = new Uint8Array(ab);
  let index = 0;
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[index >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    index++;
  }
  return ab;
}

// Derive master key using PBKDF2
export async function deriveMasterKey(password: string, saltBase64: string): Promise<ArrayBuffer> {
  const saltWA = CryptoJS.enc.Base64.parse(saltBase64);

  const key = CryptoJS.PBKDF2(password, saltWA, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
  });

  return wordArrayToArrayBuffer(key);
}

// Convert master key from base64
export async function importMasterKeyFromBase64(mk: string): Promise<ArrayBuffer> {
  const wa = CryptoJS.enc.Base64.parse(mk);
  return wordArrayToArrayBuffer(wa);
}

// Encrypt
export async function encryptMessage(masterKey: ArrayBuffer, text: string) {
  const keyWA = arrayBufferToWordArray(masterKey);

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(text, keyWA, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  };
}

// Decrypt
export async function decryptMessage(masterKey: ArrayBuffer, ciphertextBase64: string, ivBase64: string) {
  const keyWA = arrayBufferToWordArray(masterKey);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(ciphertextBase64),
    },
    keyWA,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Generate salt
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
}
