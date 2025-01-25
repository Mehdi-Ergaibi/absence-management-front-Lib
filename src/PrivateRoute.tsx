import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = () => {
  //const { user, loading } = useAuth();
  const token = localStorage.getItem("jwt");
  console.log("private route token", token);

 /*  if (loading) {
    return <p>Loading...</p>; // While verifying session, show loading state
  } */

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
