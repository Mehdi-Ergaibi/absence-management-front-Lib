import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AbsenceForm from "./AbsenceForm";
import AddProof from "./AddProof";
import "./App.css";
import BilanForm from "./BilanForm";
import Login from "./Login";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import Navbar from "./NavBar";
import Home from "./Home";
import { Toaster } from "@/components/ui/toaster";

/* import { useContext } from "react";
import AuthContext from "./context/AuthContext"; */

function App() {
  /*   const { user, logout } = useContext(AuthContext)!;
   */ return (
    <>
      {/* hello {user?.username}
      <button onClick={logout}>Logout</button> */}

      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/add-absence" element={<AbsenceForm />} />
            <Route path="/add-proof" element={<AddProof />} />
            <Route path="/bilan" element={<BilanForm />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </>
  );
}

export default App;
