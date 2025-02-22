import admin from 'firebase-admin';

// 環境変数から JSON 形式のサービスアカウントキーを取得
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

export default firestore;