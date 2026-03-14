import { auth } from "firebase-functions/v1";
import { getFirestore } from "firebase-admin/firestore";

export const onUserDeleted = auth.user().onDelete(async (user) => {
  const db = getFirestore();
  await db.collection("users").doc(user.uid).delete();
});
