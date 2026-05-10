import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  DocumentData
} from "firebase/firestore";
import { db } from "../config/firebase";

const ALERTS_COLLECTION = "alerts";

export const sendAlert = async (fromUserId: string, vehicleNumber: string, alertType: string, message: string) => {
  try {
    const docRef = await addDoc(collection(db, ALERTS_COLLECTION), {
      fromUserId,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      alertType,
      message: message || "",
      sentAt: serverTimestamp(),
      isRead: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error sending alert:", error);
    throw error;
  }
};

export const getMyAlerts = async (vehicleNumbers: string[]): Promise<DocumentData[]> => {
  try {
    if (!vehicleNumbers || vehicleNumbers.length === 0) return [];

    const q = query(
      collection(db, ALERTS_COLLECTION),
      where("vehicleNumber", "in", vehicleNumbers),
      orderBy("sentAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting alerts:", error);
    throw error;
  }
};
