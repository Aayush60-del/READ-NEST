const { initializeApp, cert, getApps } = require("firebase-admin/app");

function loadServiceAccount() {
  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawCredentials) {
    console.warn("[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON is not set. Push notifications are disabled.");
    return null;
  }

  try {
    return JSON.parse(rawCredentials);
  } catch (error) {
    console.warn("[Firebase] Invalid FIREBASE_SERVICE_ACCOUNT_JSON. Push notifications are disabled.", error.message);
    return null;
  }
}

const serviceAccount = loadServiceAccount();
const firebaseApp = serviceAccount
  ? (getApps()[0] || initializeApp({ credential: cert(serviceAccount) }))
  : null;

module.exports = firebaseApp;
