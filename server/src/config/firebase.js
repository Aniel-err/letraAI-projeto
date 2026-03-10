import admin from "firebase-admin";
import dotenv from 'dotenv';
dotenv.config();

// Lê as chaves que você vai colocar no Render
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // O replace garante que as quebras de linha da chave privada funcionem no Render
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });
}

export const bucket = admin.storage().bucket();