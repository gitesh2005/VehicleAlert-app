import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

export const setConfirmationResult = (result: FirebaseAuthTypes.ConfirmationResult) => {
  confirmationResult = result;
};

export const getConfirmationResult = () => {
  return confirmationResult;
};

export { auth, db };