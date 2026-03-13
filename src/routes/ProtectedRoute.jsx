import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config

export default function ProtectedRoute({ user, children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function checkAdmin() {
      if (!user) {
        if (alive) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const ref = doc(db, "admins", user.uid);
        const snap = await getDoc(ref);

        if (alive) {
          setIsAdmin(snap.exists());
          setLoading(false);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        if (alive) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    checkAdmin();
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) return <Navigate to="/admin/login" replace />;
  if (loading) return null; // or a spinner/loading text
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}