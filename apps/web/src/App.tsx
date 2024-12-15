import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import Footer from "./components/Footer"
import Login from "@repo/ui/login";
import { Forgetpassword } from "@repo/ui/forgetpassword"
import LearningPlan from "./components/LearningPlan";

function App() {

  return (
    <>
        <Router>
           <Routes>
              <Route path="/" element={ <LandingPage /> } />
              <Route path="/login" element={ <Login /> } />
              <Route path="/register" element={ <Login /> } />
              <Route path="/forget-password" element={ <Forgetpassword /> } />
              <Route path="/learning-plan" element={ <LearningPlan /> } />
           </Routes>
        </Router>
        <Footer />
    </>
  )
}

export default App
