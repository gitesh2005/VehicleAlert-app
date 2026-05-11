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
    const docRef = await db.collection(VEHICLES_COLLECTION).add({
      userId,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
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
  try {
    const querySnapshot = await db.collection(VEHICLES_COLLECTION)
      .where("vehicleNumber", "==", vehicleNumber.toUpperCase().trim())
      .get();
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
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
