import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const getRecommendedVersion = functions.https.onRequest(async (request, response) => {
    admin.initializeApp();
    let recommendedSnapshot:string = (await admin.database().ref("recommended").once('value')).val();
    response.send(recommendedSnapshot.replace(/-/g,"."));
});
