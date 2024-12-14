import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from "react-router-dom";
import CourseForm from "./components/CourseForm";
import Courses from "./components/Course";
import DashBoard from "./components/DashBoard";
import { Header } from "./components/Header";
import StudentsList from "./components/StudentList";
import NotFound from "./components/NotFound";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { useContext, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import EditCourse from "./components/EditCourse";
import EventsCreation from "./components/EventsCreation";
import UploadVideoToS3 from "./components/UploadVideoToS3";
import EventManagement from "./components/EventManagement";
import EventsEdit from "./components/EventsEdit";
import StudentEdit from "./components/StudentEdit";
import PathWay from "./components/PathWay";
//@ts-ignore
import Login from "@repo/ui/login"


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
          <Route path="/upload-videos" element={ <UploadVideoToS3 /> } />
          <Route path="/events-management" element={ <EventManagement /> } />
          <Route path="/events-edit/:id" element={ <EventsEdit /> } />
          <Route path="/student/:id" element={ <StudentEdit />} />
          <Route path="/pathway" element={ <PathWay /> } />
          </Route>
          <Route path="/signin" element={ <Login /> } /> 
          <Route path="*" element={ <NotFound /> } />
        </Routes>
      </Router>
    </>
  )
}

export default App
