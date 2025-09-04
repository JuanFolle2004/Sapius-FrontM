import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENERGY_KEY = 'energy.current';
const UPDATED_AT_KEY = 'energy.updatedAt';

export function useEnergy(max = 5) {
  const [energy, setEnergy] = useState<number>(max);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ENERGY_KEY);
        if (stored) setEnergy(parseInt(stored, 10));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(ENERGY_KEY, String(energy));
    AsyncStorage.setItem(UPDATED_AT_KEY, String(Date.now()));
  }, [energy]);

  const consume = (amount = 1) => {
    setEnergy((e) => Math.max(0, e - amount));
  };

  const refill = () => setEnergy(max);

  const batterySegments = useMemo(() => Array.from({ length: max }, (_, i) => i < energy), [energy, max]);

  return { energy, max, setEnergy, consume, refill, batterySegments };
}

