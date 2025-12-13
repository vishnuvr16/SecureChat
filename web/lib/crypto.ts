import CryptoJS from "crypto-js"

const PBKDF2_ITERATIONS = 100000

// Convert ArrayBuffer → WordArray
function arrayBufferToWordArray(ab: ArrayBuffer) {
  const u8 = new Uint8Array(ab)
  const words: any = []
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] |= u8[i] << (24 - (i % 4) * 8)
  }
  return CryptoJS.lib.WordArray.create(words, u8.length)
}

// Convert WordArray → ArrayBuffer
function wordArrayToArrayBuffer(wordArray: any): ArrayBuffer {
  const { words, sigBytes } = wordArray
  const ab = new ArrayBuffer(sigBytes)
  const u8 = new Uint8Array(ab)
  let index = 0
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[index >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    index++
  }
  return ab
}

// Derive master key (same as mobile)
export async function deriveMasterKey(password: string, saltBase64: string): Promise<ArrayBuffer> {
  const saltWA = CryptoJS.enc.Base64.parse(saltBase64)

  const key = CryptoJS.PBKDF2(password, saltWA, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
  })

  return wordArrayToArrayBuffer(key)
}

// Convert stored Base64 → ArrayBuffer
export async function importMasterKeyFromBase64(mkBase64: string): Promise<ArrayBuffer> {
  const wa = CryptoJS.enc.Base64.parse(mkBase64)
  return wordArrayToArrayBuffer(wa)
}

// Encrypt (same as mobile)
export async function encryptMessage(masterKey: ArrayBuffer, text: string) {
  const keyWA = arrayBufferToWordArray(masterKey)
  const iv = CryptoJS.lib.WordArray.random(16)

  const encrypted = CryptoJS.AES.encrypt(text, keyWA, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })

  return {
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  }
}

// Decrypt (same as mobile)
export async function decryptMessage(
  masterKey: ArrayBuffer,
  ciphertextBase64: string,
  ivBase64: string
) {

  const keyWA = arrayBufferToWordArray(masterKey)
  const iv = CryptoJS.enc.Base64.parse(ivBase64)

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertextBase64),
  })

  const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  console.log("from ",decrypted);
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// Generate salt (same as mobile)
export function generateSalt() {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64)
}
