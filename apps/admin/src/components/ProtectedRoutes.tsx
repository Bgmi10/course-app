import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import * as React from "react";



export default function ProtectedRoute({ children }) {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <Navigate to={'/signin'} />;
  }

  const { isauthenticated } = authContext;

  if (!isauthenticated) {
    return <Navigate to={'/signin'} />;
  }

  return <>{children}</>;
}
