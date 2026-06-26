import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "./config";

export const subscribeToCars = (onSuccess, onError) => {
  const carsRef = ref(db, "cars");
  const unsubscribe = onValue(carsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const carsArray = Object.entries(data).map(([id, car]) => ({ id, ...car }));
      onSuccess(carsArray);
    } else {
      onSuccess([]);
    }
  }, (error) => {
    if (onError) onError(error);
  });
  return unsubscribe;
};

export const addCar = async (carData) => {
  const carsRef = ref(db, "cars");
  const newCarRef = push(carsRef);
  await set(newCarRef, {
    ...carData,
    createdAt: Date.now(),
  });
  return newCarRef.key;
};

export const updateCar = async (carId, carData) => {
  const carRef = ref(db, `cars/${carId}`);
  await update(carRef, {
    ...carData,
    updatedAt: Date.now(),
  });
};

export const deleteCar = async (carId) => {
  const carRef = ref(db, `cars/${carId}`);
  await remove(carRef);
};