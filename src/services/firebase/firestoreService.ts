import {
  collection,
  addDoc,
  getDocs,
  getDoc,
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

const DEFAULT_YIELD_SCORE = 1;

export const getDailyYieldScore = async (date: Date): Promise<number> => {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'dailyYield', dateString);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.warn(`No dailyyield document found for ${dateString}, using default ${DEFAULT_YIELD_SCORE}`);
    return DEFAULT_YIELD_SCORE;
  }

  const yieldValue = snapshot.data().yield;
  if (typeof yieldValue !== 'number') {
    console.warn(`Invalid yield in dailyYield/${dateString}, using default ${DEFAULT_YIELD_SCORE}`);
    return DEFAULT_YIELD_SCORE;
  }

  return yieldValue;
};
