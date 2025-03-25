// src/app/page.tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/home/Dashboard';

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}