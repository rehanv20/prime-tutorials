import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('primetutorials_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === 'primeasim' && password === 'primeasimbt@123') {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Asim Sir',
        role: 'admin',
        email: 'admin@prime.com',
      };
      setUser(adminUser);
      localStorage.setItem('primetutorials_user', JSON.stringify(adminUser));
      return true;
    }

    // Student login: Use loginId (e.g., PT001) / student@123
    const students = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    const student = students.find((s: any) => s.loginId === email);

    if (student && password === 'student@123') {
      const studentUser: User = {
        id: student.id,
        name: student.name,
        role: 'student',
        email: student.email,
        studentId: student.id,
      };
      setUser(studentUser);
      localStorage.setItem('primetutorials_user', JSON.stringify(studentUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('primetutorials_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};