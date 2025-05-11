import { useState, useEffect } from 'react';
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedUserType }) => {
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUserType = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/protected_route', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }

                const data = await response.json();
                setUserType(data.user_type);
            } catch (error) {
                console.error('Error fetching user type:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserType();
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

    if (allowedUserType && userType !== allowedUserType) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
