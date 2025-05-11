import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    let isMounted = true;

    const fetchUserType = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/protected_route", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user info");

        const data = await response.json();
        if (isMounted) {
          setUserType(data.user_type);
        }
      } catch (err) {
        console.error("GuestRoute fetchUserType error:", err);
        if (isMounted) {
          setUserType(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserType();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return null; // or return a loading spinner
  }

  if (userType === "business") return <Navigate to="/dashboard" replace />;
  if (userType === "customer") return <Navigate to="/" replace />;

  return children;
};

export default GuestRoute;
