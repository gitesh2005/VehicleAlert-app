import firestore from '@react-native-firebase/firestore';
import { db } from "../config/firebase";

const VEHICLES_COLLECTION = "vehicles";

export const registerVehicle = async (
  userId: string, 
  vehicleNumber: string, 
  vehicleType: string,
  vehicleModel: string,
  vehicleColor: string
) => {
  try {
    const normalizedNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
    const docRef = await db.collection(VEHICLES_COLLECTION).add({
      userId,
      vehicleNumber: normalizedNumber,
      vehicleType,
      vehicleModel: vehicleModel.trim(),
      vehicleColor: vehicleColor.trim(),
      registeredAt: firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error registering vehicle:", error);
    throw error;
  }
};

export const searchVehicle = async (vehicleNumber: string) => {
  const normalizedNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
  console.log("Searching for vehicle:", normalizedNumber);
  try {
    const querySnapshot = await db.collection(VEHICLES_COLLECTION)
      .where("vehicleNumber", "==", normalizedNumber)
      .get();
    
    if (querySnapshot.empty) {
      console.log("No vehicle found for:", normalizedNumber);
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = { id: doc.id, ...doc.data() } as any;
    console.log("Vehicle found:", data);
    return data;
  } catch (error) {
    console.error("Error searching vehicle:", error);
    throw error;
  }
};

export const checkVehicleExists = async (vehicleNumber: string): Promise<boolean> => {
  try {
    const vehicle = await searchVehicle(vehicleNumber);
    return vehicle !== null;
  } catch (error) {
    console.error("Error checking vehicle existence:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId: string) => {
  try {
    await db.collection(VEHICLES_COLLECTION).doc(vehicleId).delete();
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getUserVehicleCount = async (userId: string) => {
  try {
    const snapshot = await db.collection(VEHICLES_COLLECTION)
      .where('userId', '==', userId)
      .get();
    return snapshot.size;
  } catch (error) {
    console.error("Error getting user vehicle count:", error);
    throw error;
  }
};
