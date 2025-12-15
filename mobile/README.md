# SecureChat 🔐
## End-to-End Encrypted Web & Mobile Chat Application

SecureChat is a privacy-focused personal chat application designed for secure, multi-device communication. **All messages are end-to-end encrypted**—ensuring the server never has access to plaintext message data.

---

## ✨ Key Features & Security Highlights

* **Platform Support:** Seamless chat across a **Web app (Next.js)** and a **Mobile app (React Native)**.
* **Zero-Knowledge Encryption:** End-to-End Encryption using **AES-256-GCM**.
* *Security Note:* **Server stores only ciphertext + IV**, never the plaintext messages or encryption keys.
* **Key Derivation:** Strong, unique encryption keys derived via **PBKDF2** (Password-Based Key Derivation Function 2).
* **Effortless Mobile Login:** **QR-based mobile login** for quick, secure access without typing passwords.
* **Reliable Sync:** Multi-device message sync (Web ↔ Mobile) and robust **Offline → Online sync**.
* **Data Portability:** Encrypted chat **backup & restore** functionality.
* **Secure Auth:** Robust authentication using JWT (Access & Refresh Tokens) for session management.

---

## 🧱 Tech Stack Overview

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Web App** | Next.js (App Router, TypeScript) | Frontend and API Routes |
| **Mobile App** | React Native (Expo, Dev Client) | Cross-platform mobile interface |
| **Database** | MongoDB | Primary data storage |
| **Caching/Tokens** | Redis | Session/token management |
| **Symmetric Enc.** | AES-256-GCM | Message Encryption |
| **Key Derivation** | PBKDF2 (SHA-256) | Deriving strong encryption keys from user password |
| **Authentication** | JWT (Access + Refresh Tokens) | Secure API access and session refreshing |

---

## 📂 Repository Structure

The project is split into two main directories for a clear separation of concerns:
SecureChat/ 
├── web/ # Next.js web app and backend APIs 
└── mobile/ # React Native (Expo) mobile app

---

## 🚀 How to Run the Project

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vishnuvr16/SecureChat
# OR download the ZIP and extract it
```

##  2️⃣ Run the Web App (Server & Frontend)
This handles the main API and the Web client.

```bash

cd web
npm install
npm run dev
```

The web app will be available at: http://localhost:3000

**Web Steps:**
1.  **Register** a new account.
2.  **Login** and start chatting on the web.
3.  Generate the **QR code for mobile login**.
4.  Export / Import encrypted chat backup.

### 📱 Run the Mobile App (Android)
> **Prerequisites:** Create an account on `https://expo.dev`. EAS is required for building the development APK.

## 3️⃣ Build Android APK using EASBashcd mobile

```bash
npm install
npx expo login  # Login to your Expo account
npx eas build -p android --profile development
```
Enter your Expo credentials when prompted.After the build completes, scan the QR code provided in the terminal/web link.
Download and install the APK (Development Client) on your Android phone.

# Create environment file
cp .env.example .env.local
```
# Configure environment variables in .env.local:
# EXPO_PUBLIC_API_BASE=http://localhost:3000/api
```

## 4️⃣ Start the Development ServerBashcd mobile

```bash
npx expo start --dev-client
```

You will see a QR code and a local server URL.Mobile Steps:Open the newly installed SecureChat APK on your phone.Scan the QR code shown in the terminal OR manually enter:Perlexp://<YOUR_LOCAL_IP>:<PORT>

⚠️ Note: The port (e.g., 8081 / 8001) may change. 
Use the one shown in your terminal.🔁 

### 5️⃣ App Flow (How to Use)

``` bash
1.Register / Login on Web (http://localhost:3000).
2.Open the “Login on Mobile” section on the web app to generate a QR code.
3.Open the mobile app and select → Scan QR.
4.The Mobile logs in securely without requiring a password.
5.Start chatting! Messages are securely synced across both devices.\
6.Use the Export / Import feature for encrypted chat backup.
7.Logout from any device to end the session.🔐
```

## 6️⃣ 🔐 Security Notes: End-to-End Encryption

| Principle | Details |
| :--- | :--- |
| **Message Encryption** | Messages are **encrypted on the client-side** (before leaving the device) and decrypted on the receiving client's side. |
| **Key Safety** | Encryption keys are derived via PBKDF2 from the user's password and **never leave the client device**. |
| **Server Data** | The server is **"zero-knowledge"**—it only stores encrypted data (`ciphertext + IV`) and cannot read any messages. |
| **QR Token Security** | QR codes for mobile login are designed to be **short-lived and single-use**. |
| **Session Security** | Access tokens expire automatically and are refreshed securely using refresh tokens. |

## Support & Feedback

For issues, feature requests, or contributions, please open an issue on the repository.

---
**Youtube Video Link**: https://youtu.be/jcNpetj_E7E
**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: Production Ready - Android Version Complete 
**Author** : Vishnu Vardhan Reddy