import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { ForecastResult } from '../../types';

const getUserForecastsRef = (userId: string) =>
  collection(db, 'users', userId, 'forecasts');

export const saveForecast = async (
  userId: string,
  forecast: ForecastResult
) => {
  const ref = getUserForecastsRef(userId);
  const docRef = await addDoc(ref, {
    ...forecast,
    input: {
      ...forecast.input,
      targetDate: forecast.input.targetDate.toISOString(),
    },
    savedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getForecastHistory = async (
  userId: string
): Promise<ForecastResult[]> => {
  const ref = getUserForecastsRef(userId);
  const q = query(ref, orderBy('savedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      input: {
        ...data.input,
        targetDate: new Date(data.input.targetDate),
      },
    } as ForecastResult;
  });
};

export const deleteForecast = async (userId: string, forecastId: string) => {
  const docRef = doc(db, 'users', userId, 'forecasts', forecastId);
  await deleteDoc(docRef);
};
