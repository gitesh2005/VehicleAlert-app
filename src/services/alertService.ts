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

    const vehicleSnapshot = await db.collection('vehicles')
      .where('vehicleNumber', '==', normalizedNumber)
      .limit(1)
      .get();

    let toUserId = null;

    if (!vehicleSnapshot.empty) {
      toUserId = vehicleSnapshot.docs[0].data().userId;
    }

    const alertPayload: any = {
      fromUserId: fromUserId || 'anonymous',
      toVehicleNumber: normalizedNumber,
      alertType,
      message: message || "",
      sentAt: firestore.FieldValue.serverTimestamp(),
      isRead: false,
      status: 'sent'
    };

    if (toUserId) {
      alertPayload.toUserId = toUserId;
    }

    const docRef = await db.collection(ALERTS_COLLECTION).add(alertPayload);
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

    return querySnapshot.docs.map((alertDoc: any) => ({
      id: alertDoc.id,
      ...alertDoc.data()
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
    console.log(`[ReportService] Starting false report submission: alertId=${alertId}, reporter=${userId}`);

    let alertData: any = null;

    try {
      const alertDoc: any = await db.collection(ALERTS_COLLECTION).doc(alertId).get();

      if (!alertDoc.exists) {
        throw new Error("Alert not found");
      }

      alertData = alertDoc.data();
    } catch (e) {
      console.error("[ReportService] Step 1: Error getting alert document:", e);
      throw e;
    }

    const fromUserId = alertData?.fromUserId || 'unknown';

    try {
      await db.collection('reports').add({
        reportedBy: userId || 'anonymous',
        senderId: fromUserId,
        vehicleNumber,
        alertId,
        reason,
        additionalDetails: additionalDetails || '',
        reportedAt: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        type: 'false_report'
      });

      console.log("[ReportService] Step 2: Report document created.");
    } catch (e) {
      console.error("[ReportService] Step 2: Error creating report document:", e);
      throw e;
    }

    console.log("[ReportService] Step 3: Alert update skipped.");
    console.log("[ReportService] Step 4: Trust score update skipped. Manual review needed.");

    return {
      success: true,
      message: "Report submitted successfully"
    };

  } catch (error) {
    console.error("[ReportService] Final error in submitFalseReport:", error);
    throw error;
  }
};

export const getUserFalseReportCount = async (userId: string) => {
  try {
    if (!userId) return 0;

    // Reports read is blocked by Firestore rules.
    // Manual review is needed because Cloud Functions are not being used.
    return 0;
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

    const snapshot = await db.collection(ALERTS_COLLECTION)
      .where('fromUserId', '==', userId)
      .get();

    const todayTimestamp = today.getTime();

    const count = snapshot.docs.filter((alertDoc: any) => {
      const data = alertDoc.data();
      const sentAt = data.sentAt?.toDate ? data.sentAt.toDate().getTime() : 0;
      return sentAt >= todayTimestamp;
    }).length;

    return count;
  } catch (error) {
    console.error("Error getting daily alert count:", error);
    throw error;
  }
};