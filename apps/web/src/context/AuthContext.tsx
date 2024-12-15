import { auth } from "@secx/utils/src/firebase";
import { User, onAuthStateChanged, signOut  } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<{ 
    user: User | null; 
    isauthenticated: boolean; 
    Logout: () => any;
  } | null>(null);
  
 

export default function AuthProvider ({ children } : {children: any}){

    const [user, setUser] = useState<User | null>(null);
    const [isauthenticated, setIsAuthenticated] = useState(false); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            console.log(currentuser)
           if(currentuser){
            setUser(currentuser);
            setIsAuthenticated(true);
           }
           else{
            setUser(null);
            setIsAuthenticated(false);
           }
           setLoading(false);
        })
     
     return () => unsubscribe()
    },[]);

    if(loading){
        return;
    }

    const Logout = async() => {
        try{
            await signOut(auth);
            setIsAuthenticated(false);
            setUser(null);
        }
        catch(e){
            console.log(e);
        }
    }

    
    return(
       <>
        <AuthContext.Provider value={{ user, isauthenticated, Logout }}>{children}</AuthContext.Provider>
       </> 
    )
}