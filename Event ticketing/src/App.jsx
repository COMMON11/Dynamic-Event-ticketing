import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Registration from "./Auth/Registration";
import Home from "./Home";
import UserDetails from "./Auth/UserDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/user" element={<UserDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
