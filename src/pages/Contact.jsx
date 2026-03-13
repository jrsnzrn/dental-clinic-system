import { useEffect, useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ map modal state
  const [openMap, setOpenMap] = useState(false);

  // ✅ your address 
  const addressText =
  "Topdent Dental Clinic, 67 MacArthur Hwy, Banga, Meycauayan, Bulacan";
  const mapEmbedUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(addressText) +
    "&output=embed";

  function submit(e) {
    e.preventDefault();
    alert("Message sent (demo)! You can connect this to Firestore/email later.");
    setName("");
    setMsg("");
  }

  // ✅ ESC to close modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMap(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>Contact</h1>
        <p>Let’s talk. Hover the cards—everything is interactive and mobile-friendly.</p>
      </div>

      <div className="contactGrid">
        <div className="contactCard">
          <div className="cardHeader">
            <div>
              <h3 className="title">Send a Message</h3>
              <p className="sub">We usually respond within 24 hours (business days).</p>
            </div>
            <span className="badge">Support</span>
          </div>

          <form className="form" onSubmit={submit}>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="input"
              rows={5}
              placeholder="Your message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <button className="btn">Send</button>
          </form>
        </div>

        <div className="contactCard">
          <h3 className="title">Clinic Details</h3>
          <p className="sub">Click the address to view the map.</p>

          {/* ✅ CLICK ADDRESS -> OPEN MAP */}
          <button
            type="button"
            className="iconRow"
            onClick={() => setOpenMap(true)}
            style={{ width: "100%", textAlign: "left" }}
            aria-label="Open map"
          >
            <div className="iconBubble">📍</div>
            <div>
              <div><b>Address</b></div>
              <div className="smallMuted">67 MacArthur Hwy, Banga, Meycauayan, Bulacan</div>
            </div>
            <span className="pill" style={{ marginLeft: "auto" }}>View Map</span>
          </button>

          <div className="iconRow">
            <div className="iconBubble">☎️</div>
            <div>
              <div><b>Phone</b></div>
              <div className="smallMuted">+63 994 376 6421</div>
            </div>
          </div>

          <div className="iconRow">
            <div className="iconBubble">✉️</div>
            <div>
              <div><b>Email</b></div>
              <div className="smallMuted">TopDent@gmail.com</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }} className="note">
            Tip: Press <b>Esc</b> to close the map.
          </div>
        </div>
      </div>

      {/* ✅ MAP MODAL */}
      {openMap && (
        <div className="modalOverlay" onClick={() => setOpenMap(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Our Location</h3>
              <button
                className="modalClose"
                onClick={() => setOpenMap(false)}
                aria-label="Close map"
              >
                ✕
              </button>
            </div>

            <iframe
              className="mapFrame"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            />
          </div>
        </div>
      )}
    </div>
  );
}