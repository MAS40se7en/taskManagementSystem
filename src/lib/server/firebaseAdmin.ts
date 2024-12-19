import admin from 'firebase-admin';
//import { readFileSync } from 'fs';
//import { join } from 'path';

//const serviceAccountPath = join(process.cwd(), '/src/lib/server/serviceAccountKey.json');
//const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const serviceAccountKey = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'))
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
    })
}


export default admin;
