import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import Footer from "./components/Footer"

function App() {

  return (
    <>
        <Router>
           <Routes>
              <Route path="/" element={ <LandingPage /> } />
           </Routes>
        </Router>
        <Footer />
    </>
  )
}

export default App
