import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoutes ({ children } : { children: React.FC}){
    const { isauthenticated } = useContext(AuthContext);

    return(
        <>
          { isauthenticated ? children : <Navigate  to={'/login'} /> }
        </>
    )
}