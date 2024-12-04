import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from "react-router-dom";
import CourseForm from "./components/CourseForm";
import Courses from "./components/Course";
import DashBoard from "./components/DashBoard";
import { Header } from "./components/Header";
import StudentsList from "./components/StudentList";
import Signin from "./components/auth/Signin";
import NotFound from "./components/NotFound";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { useContext, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import EditCourse from "./components/EditCourse";
import EventsCreation from "./components/EventsCreation";


function App() {
  //@ts-ignore
  const {user} = useContext(AuthContext);
 
  useEffect(() => {
     if(user){
       <Navigate to={'/'}/>
     }
      <Navigate to={'/signin'} />
  },[user]);

  return (
    <>
      <Router>
       <Header />
        <Routes>
          <Route path="/" element={ <DashBoard /> } />
          <Route element={ <ProtectedRoutes children={ <Outlet /> }/> }>
          <Route path="/create-course" element={ <CourseForm /> } />
          <Route path="/view-courses" element={ <Courses /> } />
          <Route path="/student-list" element={ <StudentsList /> } />
          <Route path="/events" element={ <EventsCreation /> } />
          <Route path="/edit-course/:id" element={ <EditCourse /> } />
          </Route>
          {<Route path="/signin" element={ <Signin /> } />}
          <Route path="*" element={ <NotFound /> } />
        </Routes>
      </Router>
    </>
  )
}

export default App
