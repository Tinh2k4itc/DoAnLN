import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from './AuthPage/AuthForm';
import AdminForm from "./AdminPage/AdminForm";
import UserPage from "./UserPage/UserPage";
import TestTaking from "./UserPage/TestTaking";
import TestResult from "./UserPage/TestResult";
import { auth, db } from "./shared/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Auth Context
interface AuthContextType {
  loading: boolean;
  user: any;
  role: string | null;
}

const AuthContext = React.createContext<AuthContextType>({
  loading: true,
  user: null,
  role: null,
});

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthContextType>({
    loading: true,
    user: null,
    role: null,
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User role:', userData.role);
            setState({ loading: false, user, role: userData.role });
          } else {
            console.log('User document not found');
            setState({ loading: false, user, role: null });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setState({ loading: false, user, role: null });
        }
      } else {
        console.log('No user authenticated');
        setState({ loading: false, user: null, role: null });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để sử dụng auth context
function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Route bảo vệ, chỉ cho user hoặc admin vào đúng page của mình
function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole: string }) {
  const { loading, user, role } = useAuth();
  
  console.log('ProtectedRoute:', { loading, user: !!user, role, requireRole });
  
  if (loading) return <div className="flex justify-center items-center h-screen">Đang kiểm tra đăng nhập...</div>;
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  if (role !== requireRole) {
    console.log('Role mismatch, redirecting to login. Expected:', requireRole, 'Got:', role);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function LoginRoute() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <AuthForm onClose={() => {}} />
    </div>
  );
}

// Hook kiểm tra user đăng nhập & role
function useAuthRole() {
  const [state, setState] = React.useState<{ loading: boolean; user: any; role: string | null }>({
    loading: true,
    user: null,
    role: null,
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User role:', userData.role);
            setState({ loading: false, user, role: userData.role });
          } else {
            console.log('User document not found');
            setState({ loading: false, user, role: null });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setState({ loading: false, user, role: null });
        }
      } else {
        console.log('No user authenticated');
        setState({ loading: false, user: null, role: null });
      }
    });
    return () => unsubscribe();
  }, []);

  return state;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <AdminForm />
            </ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute requireRole="user">
              <UserPage />
            </ProtectedRoute>
          } />
          <Route path="/test-taking/:testId" element={
            <ProtectedRoute requireRole="user">
              <TestTaking />
            </ProtectedRoute>
          } />
          <Route path="/test-result/:testId" element={
            <ProtectedRoute requireRole="user">
              <TestResult />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
