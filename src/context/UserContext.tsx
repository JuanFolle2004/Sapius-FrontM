import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

interface UserContextType {
  token: string;
  setToken: (token: string) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState('');

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    setAuthToken(newToken);
  };

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    loadToken();
  }, []);

  return (
    <UserContext.Provider value={{ token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
