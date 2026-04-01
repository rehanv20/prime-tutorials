import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { initializeMockData } from './utils/mockData';

export default function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}