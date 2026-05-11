import firestore from '@react-native-firebase/firestore';
import { db } from "../config/firebase";

const ALERTS_COLLECTION = "alerts";

export const sendAlert = async (fromUserId: string, vehicleNumber: string, alertType: string, message: string) => {
  try {
    const docRef = await db.collection(ALERTS_COLLECTION).add({
      fromUserId,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      alertType,
      message: message || "",
      sentAt: firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error sending alert:", error);
    throw error;
  }
};

export const getMyAlerts = async (vehicleNumbers: string[]) => {
  try {
    if (!vehicleNumbers || vehicleNumbers.length === 0) return [];

    const querySnapshot = await db.collection(ALERTS_COLLECTION)
      .where("vehicleNumber", "in", vehicleNumbers)
      .orderBy("sentAt", "desc")
      .get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting alerts:", error);
    throw error;
  }
};
