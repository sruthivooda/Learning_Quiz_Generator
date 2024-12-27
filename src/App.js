import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Login from "./components/Login";
import Quiz from "./Quiz";
import Cquiz from "./Cquiz";
import Contact from "./contact";
import History from "./history";
import Login from "./Login";
// import Chatbot from "./chatbot";
// import Party from "./parties";
// import Dataanalysis from "./dataanalysis";
// import Prediction from "./prediction";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/" element={<Login />} />
          <Route path="/cquiz" element={<Cquiz />} />
          <Route path="/history" element={<History />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/dataanalysis" element={<Dataanalysis />} />
          <Route path="/prediction" element={<Prediction />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
