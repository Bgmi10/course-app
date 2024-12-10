import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import LandingPage from "./components/LandingPage"

function App() {

  return (
    <>
        <Router>
           <Routes>
              <Route path="/" element={ <LandingPage /> } />
           </Routes>
        </Router>
    </>
  )
}

export default App
