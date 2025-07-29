import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ correct
import { setAuthToken } from '../services/api';
import { decodeToken } from '../utils/jwt';

interface UserContextType {
  token: string;
  setToken: (token: string) => void;
  userInfo: any;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const setToken = async (newToken: string) => {
    setTokenState(newToken);
    if (newToken) {
      await AsyncStorage.setItem('token', newToken);
      setAuthToken(newToken);
      const decoded = decodeToken(newToken);
      setUserInfo(decoded);
    } else {
      await AsyncStorage.removeItem('token');
      setAuthToken('');
      setUserInfo(null);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setTokenState(storedToken);
        setAuthToken(storedToken);
        const decoded = decodeToken(storedToken);
        setUserInfo(decoded);
      }
    };
    loadToken();
  }, []);

  return (
    <UserContext.Provider value={{ token, setToken, userInfo }}>
      {children}
    </UserContext.Provider>
  );
};
