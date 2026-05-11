import firestore from '@react-native-firebase/firestore';
import { db } from "../config/firebase";

const ALERTS_COLLECTION = "alerts";

export const sendAlert = async (
  fromUserId: string, 
  toVehicleNumber: string, 
  alertType: string, 
  message: string
) => {
  try {
    const normalizedNumber = toVehicleNumber.replace(/\s/g, '').toUpperCase();
    const docRef = await db.collection(ALERTS_COLLECTION).add({
      fromUserId: fromUserId || 'anonymous',
      toVehicleNumber: normalizedNumber,
      alertType,
      message: message || "",
      sentAt: firestore.FieldValue.serverTimestamp(),
      isRead: false,
      status: 'sent'
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
      .where("toVehicleNumber", "in", vehicleNumbers)
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

export const markAlertAsRead = async (alertId: string) => {
  try {
    await db.collection(ALERTS_COLLECTION).doc(alertId).update({
      isRead: true
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    throw error;
  }
};

export const deleteAlert = async (alertId: string) => {
  try {
    await db.collection(ALERTS_COLLECTION).doc(alertId).delete();
  } catch (error) {
    console.error("Error deleting alert:", error);
    throw error;
  }
};

export const submitFalseReport = async (
  userId: string,
  vehicleNumber: string,
  alertId: string,
  reason: string,
  additionalDetails: string
) => {
  try {
    // 1. Create report
    await db.collection('reports').add({
      reportedBy: userId || 'anonymous',
      vehicleNumber,
      alertId,
      reason,
      additionalDetails: additionalDetails || '',
      reportedAt: firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    // 2. Update original alert
    await db.collection(ALERTS_COLLECTION).doc(alertId).update({
      falseReportCount: firestore.FieldValue.increment(1)
    });

  } catch (error) {
    console.error("Error submitting false report:", error);
    throw error;
  }
};

export const getUserFalseReportCount = async (userId: string) => {
  try {
    if (!userId) return 0;
    const snapshot = await db.collection('reports')
      .where('reportedBy', '==', userId)
      .get();
    return snapshot.size;
  } catch (error) {
    console.error("Error getting user false report count:", error);
    throw error;
  }
};

export const getUserDailyAlertCount = async (userId: string) => {
  try {
    if (!userId) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all alerts from this user and filter by date in memory 
    // to avoid requiring a composite index
    const snapshot = await db.collection(ALERTS_COLLECTION)
      .where('fromUserId', '==', userId)
      .get();
    
    const todayTimestamp = today.getTime();
    const count = snapshot.docs.filter(doc => {
      const data = doc.data();
      const sentAt = data.sentAt?.toDate ? data.sentAt.toDate().getTime() : 0;
      return sentAt >= todayTimestamp;
    }).length;
    
    return count;
  } catch (error) {
    console.error("Error getting daily alert count:", error);
    throw error;
  }
};
