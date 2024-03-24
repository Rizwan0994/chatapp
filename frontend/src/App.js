import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Chatpage from "./Pages/Chatpage";
import Homepage from "./Pages/Homepage";

function App() {
  return (
    <div className="App" style={{background:'#0f1628'}}>
      {/* <Router>*/}
        <Routes> 
          <Route path="/" element={<Homepage />} />
          <Route path="/chats" element={<Chatpage />} />
         </Routes>
     {/* </Router> */}
    </div>
  );
}

export default App;
