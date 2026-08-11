import { Navigate, Outlet } from "react-router-dom";


export default function ProviderRoute() {
  const token= localStorage.getItem("tenadam_auth_token");
  const role= localStorage.getItem("tenadam_provider_role");
  const profileCompleted = localStorage.getItem("tenadam_profile_completed");

  if (!token) {
    return <Navigate to="/doctorlogin" />;
  }
  if (role !== "provider") {
    return <Navigate to="/user" />;
  }
  if (profileCompleted !== "true") {
    return <Navigate to="/complete-profile" />;
  }
  return <Outlet />;
}
