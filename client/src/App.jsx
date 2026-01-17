import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Conferences from './pages/Conferences';
import ConferenceForm from './pages/ConferenceForm';
import Papers from './pages/Papers';
import SubmitPaper from './pages/SubmitPaper';
import Reviews from './pages/Reviews';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Dashboard />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/conferences" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Conferences />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/conferences/new" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <ConferenceForm />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/conferences/:id/edit" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <ConferenceForm />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/papers" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Papers />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/papers/submit" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <SubmitPaper />
                        </main>
                    </div>
                </PrivateRoute>
            } />
            <Route path="/reviews" element={
                <PrivateRoute>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Reviews />
                        </main>
                    </div>
                </PrivateRoute>
            } />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
