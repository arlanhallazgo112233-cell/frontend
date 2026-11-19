import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  authPersistence,
  db,
  googleProvider,
} from './firebase.js';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import Display from './components/Display.jsx';

const authMessage = (error) => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'auth/invalid-credential')
    return 'Incorrect email or password.';

  if (code === 'auth/invalid-api-key')
    return 'Firebase API key is invalid. Check the grabiii-react Web App configuration in Firebase Console.';

  if (code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.')
    return 'Firebase API key is not valid. Verify the API key belongs to the grabiii-react project.';

  if (code === 'auth/unauthorized-domain')
    return 'This website is not authorized in Firebase Authentication. Add localhost to Authorized domains.';

  if (code === 'auth/popup-blocked')
    return 'The Google sign-in popup was blocked by the browser.';

  if (code === 'auth/popup-closed-by-user')
    return 'Google sign-in was cancelled.';

  if (code === 'auth/network-request-failed')
    return 'Firebase could not connect. Check your internet connection.';

  if (code === 'auth/email-already-in-use')
    return 'That email is already registered.';

  if (message.includes('API_KEY_INVALID'))
    return 'Firebase rejected the API key. Verify the API key and Google Cloud API restrictions for grabiii-react.';

  return message || 'Unable to complete authentication.';
};

function ProtectedRoute({ user, role, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={role === 'admin' ? '/admin' : '/customer-dashboard'}
        replace
      />
    );
  }

  return children;
}

function AppRoutes({
  user,
  role,
  authError,
  clearError,
  login,
  googleLogin,
  signup,
  logout,
}) {
  const navigate = useNavigate();

  const home = role === 'admin' ? '/admin' : '/customer-dashboard';

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <Landing
              onLogin={() => navigate('/login')}
              onSignup={() => navigate('/signup')}
            />
          )
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <Login
              onLogin={login}
              onGoogleLogin={googleLogin}
              onSignup={() => navigate('/signup')}
              externalError={authError}
              onClearError={clearError}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/customer-dashboard" replace />
          ) : (
            <Signup
              onSignup={signup}
              onBackToLogin={() => navigate('/login')}
            />
          )
        }
      />

      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute
            user={user}
            role={role}
            allowedRoles={['customer']}
          >
            <CustomerDashboard
              user={user}
              onLogout={logout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            user={user}
            role={role}
            allowedRoles={['admin']}
          >
            <Display
              user={user}
              onLogout={logout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    authPersistence
      .catch((error) => {
        if (active) {
          setAuthError(authMessage(error));
        }
      })
      .finally(() => {
        unsubscribe = onAuthStateChanged(
          auth,
          async (currentUser) => {
            if (!active) return;

            setAuthError('');

            if (!currentUser) {
              setUser(null);
              setRole(null);
              setLoading(false);
              return;
            }

            try {
              const ref = doc(db, 'users', currentUser.uid);
              let snap = await getDoc(ref);

              if (!snap.exists()) {
                await setDoc(ref, {
                  uid: currentUser.uid,
                  name: currentUser.displayName || '',
                  email: currentUser.email || '',
                  role: 'customer',
                  createdAt: serverTimestamp(),
                });

                snap = await getDoc(ref);
              }

              const userRole = snap.data()?.role;

              if (!['admin', 'customer'].includes(userRole)) {
                await signOut(auth);
                throw new Error(
                  'Your account has no valid Grabiii role.'
                );
              }

              setUser(currentUser);
              setRole(userRole);
            } catch (error) {
              console.error(
                'Grabiii auth/profile error:',
                error
              );

              setUser(null);
              setRole(null);
              setAuthError(authMessage(error));

              try {
                await signOut(auth);
              } catch {}
            } finally {
              setLoading(false);
            }
          }
        );
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(email, password) {
    setAuthError('');

    try {
      await authPersistence;

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error) {
      const message = authMessage(error);

      setAuthError(message);
      throw new Error(message);
    }
  }

  async function googleLogin() {
    setAuthError('');

    try {
      await authPersistence;

      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (error) {
      const message = authMessage(error);

      setAuthError(message);
      throw new Error(message);
    }
  }

  async function signup({ name, email, password }) {
    setAuthError('');

    try {
      await authPersistence;

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          uid: credential.user.uid,
          name: name.trim(),
          email:
            credential.user.email || email.trim(),
          role: 'customer',
          createdAt: serverTimestamp(),
        }
      );
    } catch (error) {
      const message = authMessage(error);

      setAuthError(message);
      throw new Error(message);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-brand" />
        <p>Loading Grabiii...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        user={user}
        role={role}
        authError={authError}
        clearError={() => setAuthError('')}
        login={login}
        googleLogin={googleLogin}
        signup={signup}
        logout={logout}
      />
    </BrowserRouter>
  );
}