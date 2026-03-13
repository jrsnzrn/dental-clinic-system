import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function NavBar() {
  const navClass = ({ isActive }) => "navItem" + (isActive ? " active" : "");

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setIsAdmin(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "admins", u.uid));
        setIsAdmin(snap.exists());
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      }
    });

    return () => unsub();
  }, []);

  async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout failed:", e);
  }
}

  return (
    <div className="nav">
      <div className="navInner">
        <div className="brand brand-bounce">
          <span className="logo-tooth">🦷</span>
          <span className="logo-text">TopDent</span>
          <span className="badge">Dental Clinic</span>
        </div>

        <div className="navLinks">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/services" className={navClass}>Services</NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
          <NavLink to="/book" className={navClass}>Book</NavLink>
        </div>

        <div className="spacer" />

        {/* ✅ Right side */}
     <div className="navLinks">
  {/* Logged out: show Admin Login */}
  {!user && (
    <NavLink to="/admin/login" className={navClass}>
      Admin Login
    </NavLink>
  )}

  {/* Logged in: show Logout */}
  {user && (
    <button className="navItem" onClick={logout} type="button">
      Logout
    </button>
  )}

  {/* Logged in admin: show Admin */}
  {user && isAdmin && (
    <NavLink to="/admin" className={navClass}>
      Admin
    </NavLink>
  )}
</div>
      </div>
    </div>
  );
}