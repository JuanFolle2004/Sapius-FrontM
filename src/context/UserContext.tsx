import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';
import { getMe } from '../services/userService';   // 👈 add this

// 👉 define a proper User type according to your backend
type User = {
  id: string;
  email: string;
  name: string;
  lastname: string;
  interests?: string[];
};

type Ctx = {
  token: string;
  isLoading: boolean;
  setToken: (t: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  setUser: (u: User | null) => void;
};

const UserContext = createContext<Ctx | null>(null);

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error('useUser must be used within UserProvider');
  return c;
};

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setTokenState] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const setToken = async (t: string) => {
    setTokenState(t);
    setAuthToken(t);
    if (t) {
      await AsyncStorage.setItem('token', t);
    } else {
      await AsyncStorage.removeItem('token');
    }
  };

  const logout = async () => {
    await setToken('');
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('token');
      if (stored) {
        console.log("🔐 Found stored token:", stored);
        setAuthToken(stored);
        setTokenState(stored);

        try {
          const profile = await getMe(stored); // 👈 fetch backend user
          console.log("👤 Loaded profile:", profile);
          setUser(profile);
        } catch (e) {
          console.log("⚠️ Failed to fetch profile, clearing token", e);
          if ((e as any)?.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            setTokenState('');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    })();
  }, []);

  return (
    <UserContext.Provider value={{ token, isLoading, setToken, logout, user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
