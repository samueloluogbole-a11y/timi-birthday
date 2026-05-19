import { useState, useEffect, useRef } from "react";

const EMOJIS = ["🌿", "✨", "🥂", "🌙", "🦋", "💫", "🌾", "🎶", "💌", "🕊️", "🌱", "⭐"];
const STORAGE_KEY = "timi-birthday-messages-v2";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [submitted, setSubmitted] = useState(false);
  const [liked, setLiked] = useState({});
  const [photo, setPhoto] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result?.value) setMessages(JSON.parse(result.value));
        const photoResult = await window.storage.get("timi-hero-photo", false);
        if (photoResult?.value) setPhoto(photoResult.value);
      } catch {}
    };
    load();
    setTimeout(() => setHeroLoaded(true), 100);
  }, []);

  const save = async (updated) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
    } catch {}
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      try { await window.storage.set("timi-hero-photo", dataUrl, false); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!name.trim() || !text.trim()) return;
    const newMsg = {
      id: Date.now(),
      name: name.trim(),
      text: text.trim(),
      emoji,
      time: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      likes: 0,
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    await save(updated);
    setName(""); setText(""); setEmoji("✨");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleLike = async (id) => {
    if (liked[id]) return;
    const updated = messages.map(m => m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m);
    setMessages(updated);
    setLiked(l => ({ ...l, [id]: true }));
    await save(updated);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1e1a", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#e8e4dc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroReveal { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes pop { 0% { transform:scale(1); } 50% { transform:scale(1.4); } 100% { transform:scale(1); } }
        .hero-img { animation: heroReveal 1.2s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .card { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,0,0,0.35) !important; }
        .like-btn { transition: all 0.15s; cursor: pointer; }
        .like-btn:hover { transform: scale(1.06); }
        .like-pop { animation: pop 0.3s ease; }
        input, textarea { font-family: 'Jost', sans-serif; transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus, textarea:focus { outline: none; border-color: #7a9e7a !important; box-shadow: 0 0 0 3px rgba(122,158,122,0.15); }
        .submit-btn { transition: all 0.2s; font-family: 'Jost', sans-serif; letter-spacing: 0.08em; }
        .submit-btn:hover:not(:disabled) { background: #7a9e7a !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(122,158,122,0.3); }
        .upload-btn:hover { border-color: #7a9e7a !important; color: #7a9e7a !important; }
        .upload-btn { transition: all 0.2s; }
        ::placeholder { color: #3e5038; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #1a1e1a; }
        ::-webkit-scrollbar-thumb { background: #3a4a3a; border-radius: 10px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #2e3e2e, transparent); }
      `}</style>

      {/* Hero Section */}
      <div style={{ position: "relative", height: "100vh", maxHeight: 700, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
        {photo ? (
          <img src={photo} alt="Timi" className="hero-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #2a3528 0%, #1a2218 50%, #111411 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", border: "2px dashed #3a4e38", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", color: "#3a4e38" }}>🌿</div>
            <button className="upload-btn" onClick={() => fileRef.current?.click()} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#5a7a58", background: "transparent", border: "1px solid #3a4e38", borderRadius: 4, padding: "0.6rem 1.4rem", cursor: "pointer" }}>
              Add Your Photo
            </button>
          </div>
        )}

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(20,24,20,0.1) 0%, rgba(20,24,20,0.3) 50%, rgba(20,24,20,0.92) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, padding: "3rem 2.5rem", width: "100%", maxWidth: 760, margin: "0 auto", boxSizing: "border-box" }}>
          {photo && (
            <button className="upload-btn" onClick={() => fileRef.current?.click()} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a9e7a", background: "transparent", border: "1px solid #3a5e3a", borderRadius: 4, padding: "0.4rem 1rem", cursor: "pointer", marginBottom: "1.2rem", display: "block" }}>
              Change Photo
            </button>
          )}
          <p className="fade-up" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7a9e7a", margin: "0 0 0.6rem", animationDelay: "0.1s" }}>A celebration for</p>
          <h1 className="fade-up" style={{ fontWeight: 300, fontSize: "clamp(3rem, 8vw, 5.5rem)", margin: "0 0 0.6rem", lineHeight: 1.05, letterSpacing: "-0.01em", color: "#f0ece4", animationDelay: "0.2s" }}>
            Timi
          </h1>
          <p className="fade-up" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "#7a8a74", margin: "0 0 1.4rem", animationDelay: "0.35s" }}>
            Leave him a message — he'll treasure every word.
          </p>
          <a className="fade-up" href="#guestbook" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7a9e7a", textDecoration: "none", borderBottom: "1px solid #3a5e3a", paddingBottom: "2px", animationDelay: "0.45s", display: "inline-block" }}>
            Sign the guestbook ↓
          </a>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
      </div>

      {/* Guestbook Section */}
      <div id="guestbook" style={{ maxWidth: 720, margin: "0 auto", padding: "5rem 1.5rem 6rem" }}>
        <div style={{ marginBottom: "3.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a8a6a", margin: "0 0 0.8rem" }}>Guestbook</p>
          <h2 style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0 0 1rem", color: "#e8e4dc", letterSpacing: "0.01em" }}>Words of celebration</h2>
          <div className="divider" style={{ maxWidth: 80, margin: "0 auto" }} />
        </div>

        {/* Form */}
        <div style={{ background: "#212621", borderRadius: 4, padding: "2.2rem", border: "1px solid #2e382e", marginBottom: "3rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0", animation: "fadeUp 0.5s ease" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.8rem", animation: "shimmer 2s ease infinite" }}>✨</div>
              <p style={{ fontFamily: "'Jost', sans-serif", color: "#7a9e7a", margin: 0, fontWeight: 400, letterSpacing: "0.05em" }}>Your message has been received.</p>
            </div>
          ) : (
            <>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                maxLength={40}
                style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 3, border: "1px solid #2e3e2e", background: "#1a1e1a", color: "#e8e4dc", fontSize: "0.9rem", boxSizing: "border-box", marginBottom: "1rem" }}
              />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your birthday message…"
                maxLength={5000}
                rows={4}
                style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 3, border: "1px solid #2e3e2e", background: "#1a1e1a", color: "#e8e4dc", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }}
              />
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: "1.15rem", background: emoji === e ? "rgba(122,158,122,0.2)" : "transparent", border: emoji === e ? "1px solid #4a7a4a" : "1px solid transparent", borderRadius: 4, padding: "0.25rem 0.4rem", cursor: "pointer", transition: "all 0.15s" }}>
                    {e}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Jost', sans-serif", color: "#3e5038", fontSize: "0.75rem" }}>{text.length} / 5000</span>
                <button
                  className="submit-btn"
                  onClick={handlePost}
                  disabled={!name.trim() || !text.trim()}
                  style={{ background: name.trim() && text.trim() ? "#4a7a4a" : "#2a3a2a", color: name.trim() && text.trim() ? "#e8f4e8" : "#3a4e3a", border: "none", borderRadius: 3, padding: "0.75rem 2rem", fontSize: "0.75rem", textTransform: "uppercase", cursor: name.trim() && text.trim() ? "pointer" : "default" }}
                >
                  Post Message
                </button>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#3a4e3a", fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            Be the first to sign the guestbook.
          </div>
        ) : (
          <div>
            {messages.map((m, i) => (
              <div key={m.id}>
                <div className="card" style={{ padding: "2rem 0", animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>{m.emoji}</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, color: "#c8c4bc", fontSize: "0.88rem", letterSpacing: "0.04em" }}>{m.name}</span>
                    </div>
                    <span style={{ fontFamily: "'Jost', sans-serif", color: "#3e5038", fontSize: "0.72rem", letterSpacing: "0.05em" }}>{m.time}</span>
                  </div>
                  <p style={{ fontStyle: "italic", fontWeight: 300, fontSize: "1.15rem", lineHeight: 1.75, color: "#9a9890", margin: "0 0 1.1rem", paddingLeft: "2rem" }}>
                    "{m.text}"
                  </p>
                  <button
                    className={`like-btn ${liked[m.id] ? "like-pop" : ""}`}
                    onClick={() => handleLike(m.id)}
                    style={{ background: "transparent", border: `1px solid ${liked[m.id] ? "#4a7a4a" : "#2a3a2a"}`, borderRadius: 3, padding: "0.3rem 0.9rem", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: liked[m.id] ? "#7a9e7a" : "#3e5038", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginLeft: "2rem" }}
                  >
                    {liked[m.id] ? "✦" : "✧"} {m.likes > 0 ? m.likes : ""} {liked[m.id] ? "Loved" : "Love this"}
                  </button>
                </div>
                {i < messages.length - 1 && <div className="divider" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "2rem", borderTop: "1px solid #1e281e" }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.15em", color: "#2e3e2e", textTransform: "uppercase", margin: 0 }}>
          Made with love for Timi ✦
        </p>
      </div>
    </div>
  );
}