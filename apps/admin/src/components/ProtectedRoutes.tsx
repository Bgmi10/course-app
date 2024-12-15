import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router-dom";


export default function ProtectedRoute({ children }: {children: any}) {
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
