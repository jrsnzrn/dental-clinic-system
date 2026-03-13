
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("appointmentAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setBookings(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      (err) => console.error("Bookings read error:", err)
    );

    return () => unsub();
  }, []);

  async function setStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), { status });
  }

  async function removeBooking(id) {
    if (!confirm("Delete this booking?")) return;
    await deleteDoc(doc(db, "bookings", id));
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h3 className="title">Bookings</h3>
          <p className="sub">All appointments created by users.</p>
        </div>
        <span className="badge">{bookings.length} total</span>
      </div>

      <ul className="list">
        {bookings.map((b) => (
          <li key={b.id} className="item" style={{ alignItems: "flex-start" }}>
            <div className="kv">
              <strong>
                {b.fullName || "No name"}{" "}
                <span style={{ fontWeight: 600, opacity: 0.75 }}>
                  • {b.service || "Service"}
                </span>
              </strong>
              <span>📞 {b.phone || "-"}</span>
              <span>✉️ {b.email || "-"}</span>
              <span>🗓 {fmtDate(b.appointmentAt)}</span>
              <span>Status: <b>{b.status || "pending"}</b></span>
              {b.notes ? <span>Notes: {b.notes}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn" onClick={() => setStatus(b.id, "approved")}>
                Approve
              </button>
              <button
                className="btn secondary"
                onClick={() => setStatus(b.id, "pending")}
              >
                Set Pending
              </button>
              <button className="btn danger" onClick={() => setStatus(b.id, "cancelled")}>
                Cancel
              </button>
              <button className="btn danger" onClick={() => removeBooking(b.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {bookings.length === 0 && <div className="note">No bookings yet.</div>}
    </div>
  );
}