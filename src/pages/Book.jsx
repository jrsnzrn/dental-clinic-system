import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toLocalISODate(d) {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function isSunday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0; // 0 = Sunday
}

// Generate time slots 09:00 -> 17:30 (30-min increments)
function generateSlots() {
  const slots = [];
  for (let h = 9; h <= 17; h++) {
    slots.push(`${pad(h)}:00`);
    slots.push(`${pad(h)}:30`);
  }
  return slots;
}

export default function Book() {
  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Cleaning");
  const [date, setDate] = useState(toLocalISODate(new Date()));
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const todayStr = toLocalISODate(new Date());
  const allSlots = useMemo(() => generateSlots(), []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const availableSlots = useMemo(() => {
    // If booking is today, disable past times
    if (date !== todayStr) return allSlots;

    const now = new Date();
    const cur = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // Keep slots that are >= current time (rounding not required; this is fine)
    return allSlots.filter((t) => t >= cur);
  }, [date, todayStr, allSlots]);

  // If selected time becomes invalid (ex: you change date to today), auto-fix
  useEffect(() => {
    if (!availableSlots.includes(time)) {
      setTime(availableSlots[0] || "09:00");
    }
  }, [availableSlots, time]);

  async function loginGoogle() {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      setError("Google sign-in failed. Try again.");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please sign in with Google to book an appointment.");
      return;
    }
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim()) return setError("Please enter your phone number.");
    if (!date) return setError("Please choose a date.");
    if (date < todayStr) return setError("You cannot book before today.");
    if (isSunday(date)) return setError("Clinic is closed on Sundays. Please choose Mon–Sat.");
    if (!time) return setError("Please choose a time.");

    // Build appointmentAt timestamp
    const appointmentDate = new Date(`${date}T${time}:00`);

    // UI enforcement for clinic hours (09:00–18:00)
    const hour = appointmentDate.getHours();
    const minute = appointmentDate.getMinutes();
    const isBeforeOpen = hour < 9;
    const isAfterClose = hour > 17 || (hour === 17 && minute > 30); // last slot 17:30
    if (isBeforeOpen || isAfterClose) {
      return setError("Please choose a time between 9:00 AM and 6:00 PM.");
    }

    // If booking today, prevent past times (extra guard)
    if (date === todayStr) {
      const now = new Date();
      if (appointmentDate < now) return setError("That time already passed. Choose a later time.");
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "bookings"), {
        uid: user.uid,
        email: user.email || "",
        fullName: fullName.trim(),
        phone: phone.trim(),
        service,
        date, // YYYY-MM-DD
        time, // HH:mm
        notes: notes.trim(),
        status: "pending",
        appointmentAt: Timestamp.fromDate(appointmentDate), // ✅ used by rules
        createdAt: serverTimestamp(),
      });

      setFullName("");
      setPhone("");
      setNotes("");
      setSuccess("✅ Booking submitted! Status: pending.");
    } catch (e) {
      console.error(e);
      setError("Booking failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>Book an Appointment</h1>
        <p>
          Clinic Hours: <b>Mon–Sat • 9:00 AM – 6:00 PM</b>. You must sign in to book.
        </p>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="cardHeader">
            <div>
              <h3 className="title">Appointment Form</h3>
              <p className="sub">Choose a date and time. No past bookings allowed.</p>
            </div>
            <span className="badge">{user ? "Signed in" : "Guest"}</span>
          </div>

          {!user && (
            <button className="btn" onClick={loginGoogle} type="button">
              Sign in with Google to Book
            </button>
          )}

          <form className="form" onSubmit={submit} style={{ marginTop: 12 }}>
            <input
              className="input"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!user || saving}
            />

            <input
              className="input"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!user || saving}
            />

            <select
              className="input"
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={!user || saving}
            >
              <option>Cleaning</option>
              <option>Fillings</option>
              <option>Extraction</option>
              <option>Braces Consultation</option>
              <option>Root Canal</option>
              <option>Whitening</option>
            </select>

            <input
              className="input"
              type="date"
              value={date}
              min={todayStr}                 // ✅ blocks earlier than today
              onChange={(e) => setDate(e.target.value)}
              disabled={!user || saving}
            />

            {/* show warning if Sunday */}
            {date && isSunday(date) && (
              <div className="error">Closed on Sundays — choose Mon–Sat.</div>
            )}

            <select
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!user || saving || isSunday(date)}
            >
              {availableSlots.length === 0 ? (
                <option value="">No available times today</option>
              ) : (
                availableSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>

            <textarea
              className="input"
              rows={4}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!user || saving}
            />

            <button className="btn" disabled={!user || saving || isSunday(date)}>
              {saving ? "Submitting..." : "Submit Booking"}
            </button>

            {error && <div className="error">{error}</div>}
            {success && <div className="note">{success}</div>}
          </form>
        </div>

        <div className="card">
          <h3 className="title">Booking Rules</h3>
          <p className="sub">For a smooth clinic schedule:</p>
          <ul className="note" style={{ lineHeight: 1.7 }}>
            <li>✅ Must be signed in with Google</li>
            <li>✅ No booking before today</li>
            <li>✅ Mon–Sat only</li>
            <li>✅ 9:00 AM – 6:00 PM only</li>
            <li>✅ Status starts as <b>pending</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}