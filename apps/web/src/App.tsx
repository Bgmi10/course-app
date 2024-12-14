import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import Footer from "./components/Footer"
import Login from "@repo/ui/login";

function App() {

  return (
    <>
        <Router>
           <Routes>
              <Route path="/" element={ <LandingPage /> } />
              <Route path="/login" element={ <Login /> } />
           </Routes>
        </Router>
        <Footer />
    </>
  )
}

export default App
