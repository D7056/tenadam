
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function UserRoute() {
    const {user, role, loading} = useAuth();
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" />;
    }
    if (role === "user") {
        return <Outlet />;
    } else {
        return <Navigate to="/doctorlogin" />;
    }
}