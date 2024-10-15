import { BrowserRouter as Router, Route, Routes, } from "react-router-dom";

import Sidebar from "./Sidebar";
import About from "./About";
import Basics from "./Basics";
import PersonalFinance from "./PersonalFinance";
import Footer from "./Footer";

import "./styles/App.css"


function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/basics" element={<Basics />} />
            <Route path="/personal_finance" element={<PersonalFinance />} />
          </Routes>
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
