import { useEffect, useState, createContext, ReactNode } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export const AuthContext = createContext<{ 
  user: User | null; 
  isauthenticated: boolean; 
  Logout: () => Promise<string>;
} | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isauthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const Logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      return 'logout success';
    } catch (e) {
      console.log(e);
      return 'logout failed';
    }
  };

  if (loading) {
    return;
   }

  return (
    <AuthContext.Provider value={{ user, isauthenticated, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
