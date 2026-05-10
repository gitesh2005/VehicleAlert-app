import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "../config/firebase";

const VEHICLES_COLLECTION = "vehicles";

export const registerVehicle = async (userId: string, vehicleNumber: string, vehicleType: string) => {
  try {
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
      userId,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      registeredAt: serverTimestamp(),
      isActive: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error registering vehicle:", error);
    throw error;
  }
};

export const searchVehicle = async (vehicleNumber: string): Promise<(DocumentData & { id: string }) | null> => {
  try {
    const q = query(
      collection(db, VEHICLES_COLLECTION), 
      where("vehicleNumber", "==", vehicleNumber.toUpperCase().trim())
    );
    const querySnapshot = await getDocs(q);
    
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
