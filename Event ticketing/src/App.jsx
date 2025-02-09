import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Registration from "./Auth/Registration";
import Home from "./Home";
import UserDetails from "./Auth/UserDetails";
import CreateEvent from "./Events/CreateEvent";
import ViewEvents from "./Events/ViewEvents";
import GetEvent from "./Events/GetEvent";
import EditEvent from "./Events/EditEvent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/user" element={<UserDetails />} />
        <Route path="/createEvent" element={<CreateEvent />} />
        <Route path="/EventList" element={<ViewEvents />} />
        <Route path="/event/:id" element={<GetEvent />} />
        <Route path="/event/edit/:id" element={<EditEvent />} />
      </Routes>
    </Router>
  );
}

export default App;
