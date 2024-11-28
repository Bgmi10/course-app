import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CourseForm from "./components/CourseForm";
import Courses from "./components/Course";
import DashBoard from "./components/DashBoard";
import { Header } from "./components/Header";
import StudentsList from "./components/StudentList";
import Signin from "./components/auth/Signin";
function App() {

  return (
    <>
    <Router>
    <Header />
    </Router>
      <Router>
        <Routes>
          <Route path="/" element={ <DashBoard /> } />
          <Route path="/courses" element={ <Courses /> } />
          <Route path="/courses/new" element={ <CourseForm /> } />
          <Route path="/students" element={ <StudentsList /> } />
          <Route path="/signin" element={ <Signin /> } />
        </Routes>
      </Router>
    </>
  )
}

export default App
