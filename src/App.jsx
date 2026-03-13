import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";


import NavBar from "./components/NavBar";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Book from "./pages/Book";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Patients from "./pages/admin/Patients";
import Bookings from "./pages/admin/Bookings";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  if (loadingAuth) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <BrowserRouter>
      <NavBar />

     <div className="appMain">
        <Routes>
  {/* Public */}
  <Route path="/" element={<Home />} />
  <Route path="/services" element={<Services />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/book" element={<Book />} />

  {/* Admin login */}
  <Route path="/admin/login" element={<Login />} />

  {/* Admin protected */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute user={user}>
        <Dashboard />
      </ProtectedRoute>
    }
  >
    <Route path="patients" element={<Patients />} />
    <Route path="bookings" element={<Bookings />} />
  </Route>
</Routes>
      </div>
    </BrowserRouter>
  );
}