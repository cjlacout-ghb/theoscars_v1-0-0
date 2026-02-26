import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// SUPABASE CONFIG — reemplazá estos dos valores
// los encontrás en tu proyecto: Settings → API
// ─────────────────────────────────────────────
const SUPABASE_URL = "https://lezdpqvgizwocanjeray.supabase.co";
const SUPABASE_KEY = "sb_publishable_U1MphUk0VKWQCLJFIJSeBg_L2h7F08X";

// Tabla necesaria en Supabase (corré esto en el SQL Editor):
//
// CREATE TABLE oscars_storage (
//   key TEXT PRIMARY KEY,
//   value TEXT
// );

async function storageGet(key) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/oscars_storage?key=eq.${key}&select=value`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const data = await res.json();
    return data.length > 0 ? JSON.parse(data[0].value) : null;
  } catch {
    return null;
  }
}

async function storageSet(key, val) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/oscars_storage`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ key, value: JSON.stringify(val) }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("storageSet error:", res.status, txt);
    }
  } catch (err) {
    console.error("storageSet fetch failed:", err);
  }
}

// ─────────────────────────────────────────────
// DATOS — 24 categorías reales 98ª edición 2026
// ─────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "best_picture",
    name: "Mejor Película",
    nominees: [
      "Bugonia", "F1", "Frankenstein", "Hamnet", "Marty Supreme",
      "One Battle After Another", "The Secret Agent", "Sentimental Value",
      "Sinners", "Train Dreams",
    ],
  },
  {
    id: "best_director",
    name: "Mejor Dirección",
    nominees: [
      "Chloé Zhao · Hamnet", "Josh Safdie · Marty Supreme",
      "Paul Thomas Anderson · One Battle After Another",
      "Joachim Trier · Sentimental Value", "Ryan Coogler · Sinners",
    ],
  },
  {
    id: "best_actor",
    name: "Mejor Actor",
    nominees: [
      "Timothée Chalamet · Marty Supreme",
      "Leonardo DiCaprio · One Battle After Another",
      "Ethan Hawke · Blue Moon", "Michael B. Jordan · Sinners",
      "Wagner Moura · The Secret Agent",
    ],
  },
  {
    id: "best_actress",
    name: "Mejor Actriz",
    nominees: [
      "Jessie Buckley · Hamnet", "Rose Byrne · If I Had Legs I'd Kick You",
      "Kate Hudson · Song Sung Blue", "Renate Reinsve · Sentimental Value",
      "Emma Stone · Bugonia",
    ],
  },
  {
    id: "best_supporting_actor",
    name: "Mejor Actor de Reparto",
    nominees: [
      "Benicio Del Toro · One Battle After Another",
      "Jacob Elordi · Frankenstein", "Delroy Lindo · Sinners",
      "Sean Penn · One Battle After Another",
      "Stellan Skarsgård · Sentimental Value",
    ],
  },
  {
    id: "best_supporting_actress",
    name: "Mejor Actriz de Reparto",
    nominees: [
      "Elle Fanning · Sentimental Value",
      "Inga Ibsdotter Lilleaas · Sentimental Value",
      "Amy Madigan · Weapons", "Wunmi Mosaku · Sinners",
      "Teyana Taylor · One Battle After Another",
    ],
  },
  {
    id: "best_adapted_screenplay",
    name: "Mejor Guión Adaptado",
    nominees: [
      "Bugonia · Will Tracy", "Frankenstein · Guillermo del Toro",
      "Hamnet · Chloé Zhao y Maggie O'Farrell",
      "One Battle After Another · Paul Thomas Anderson",
      "Train Dreams · Clint Bentley y Greg Kwedar",
    ],
  },
  {
    id: "best_original_screenplay",
    name: "Mejor Guión Original",
    nominees: [
      "Blue Moon · Robert Kaplow", "It Was Just An Accident · Jafar Panahi",
      "Marty Supreme · Josh Safdie y Ronald Bronstein",
      "Sentimental Value · Eskil Vogt y Joachim Trier",
      "Sinners · Ryan Coogler",
    ],
  },
  {
    id: "best_casting",
    name: "Mejor Casting ✦ nueva categoría",
    nominees: [
      "Hamnet · Nina Gold", "Marty Supreme · Jennifer Venditti",
      "One Battle After Another · Cassandra Kulukundis",
      "The Secret Agent · Gabriel Domingues", "Sinners · Francine Maisler",
    ],
  },
  {
    id: "best_animated_feature",
    name: "Mejor Película Animada",
    nominees: [
      "Arco", "Elio", "KPop Demon Hunters",
      "Little Amélie or the Character of Rain", "Zootopia 2",
    ],
  },
  {
    id: "best_international_film",
    name: "Mejor Película Internacional",
    nominees: [
      "The Secret Agent · Brasil", "It Was Just an Accident · Francia",
      "Sentimental Value · Noruega", "Sirat · España",
      "The Voice of Hind Rajab · Túnez",
    ],
  },
  {
    id: "best_documentary",
    name: "Mejor Documental",
    nominees: [
      "The Alabama Solution", "Come See Me in the Good Light",
      "Cutting through Rocks", "Mr. Nobody against Putin", "The Perfect Neighbor",
    ],
  },
  {
    id: "best_documentary_short",
    name: "Mejor Cortometraje Documental",
    nominees: [
      "All the Empty Rooms",
      "Armed Only with a Camera: The Life and Death of Brent Renaud",
      "Children No More: Were and Are Gone",
      "The Devil Is Busy", "Perfectly a Strangeness",
    ],
  },
  {
    id: "best_live_action_short",
    name: "Mejor Cortometraje",
    nominees: [
      "Butcher's Stain", "A Friend of Dorothy", "Jane Austen's Period Drama",
      "The Singers", "Two People Exchanging Saliva",
    ],
  },
  {
    id: "best_animated_short",
    name: "Mejor Cortometraje Animado",
    nominees: [
      "Butterfly", "Forevergreen", "The Girl Who Cried Pearls",
      "Retirement Plan", "The Three Sisters",
    ],
  },
  {
    id: "best_score",
    name: "Mejor Banda Sonora Original",
    nominees: [
      "Bugonia · Jerskin Fendrix", "Frankenstein · Alexandre Desplat",
      "Hamnet · Max Richter", "One Battle After Another · Jonny Greenwood",
      "Sinners · Ludwig Göransson",
    ],
  },
  {
    id: "best_song",
    name: "Mejor Canción Original",
    nominees: [
      '"Dear Me" · Diane Warren: Relentless',
      '"Golden" · KPop Demon Hunters',
      '"I Lied To You" · Sinners',
      '"Sweet Dreams Of Joy" · Viva Verdi!',
      '"Train Dreams" · Train Dreams',
    ],
  },
  {
    id: "best_cinematography",
    name: "Mejor Fotografía",
    nominees: [
      "Frankenstein · Dan Laustsen", "Marty Supreme · Darius Khondji",
      "One Battle After Another · Michael Bauman",
      "Sinners · Autumn Durald Arkapaw", "Train Dreams · Adolpho Veloso",
    ],
  },
  {
    id: "best_editing",
    name: "Mejor Edición",
    nominees: [
      "F1 · Stephen Mirrione",
      "Marty Supreme · Ronald Bronstein y Josh Safdie",
      "One Battle After Another · Andy Jurgensen",
      "Sentimental Value · Olivier Bugge Coutté",
      "Sinners · Michael P. Shawver",
    ],
  },
  {
    id: "best_production_design",
    name: "Mejor Diseño de Producción",
    nominees: [
      "Frankenstein · Tamara Deverell", "Hamnet · Fiona Crombie",
      "Marty Supreme · Jack Fisk",
      "One Battle After Another · Florencia Martin",
      "Sinners · Hannah Beachler",
    ],
  },
  {
    id: "best_costume_design",
    name: "Mejor Diseño de Vestuario",
    nominees: [
      "Avatar: Fire and Ash · Deborah L. Scott", "Frankenstein · Kate Hawley",
      "Hamnet · Malgosia Turzanska", "Marty Supreme · Miyako Bellizzi",
      "Sinners · Ruth E. Carter",
    ],
  },
  {
    id: "best_makeup",
    name: "Mejor Maquillaje y Peluquería",
    nominees: [
      "Frankenstein", "Kokuho", "Sinners", "The Smashing Machine", "The Ugly Stepsister",
    ],
  },
  {
    id: "best_sound",
    name: "Mejor Sonido",
    nominees: ["F1", "Frankenstein", "One Battle After Another", "Sinners", "Sirat"],
  },
  {
    id: "best_vfx",
    name: "Mejores Efectos Visuales",
    nominees: [
      "Avatar: Fire and Ash", "F1", "Jurassic World Rebirth", "The Lost Bus", "Sinners",
    ],
  },
];

const EMOJIS = ["🦁", "🌙", "⭐", "🎭", "🍿", "🎬", "🏆", "🌹", "💎", "👑", "🦋", "🎪"];
const ADMIN_PASSWORD = "oscars2026";
const GOLD = "#C9A84C";
const DARK = "#0a0a0a";

const VOTES_KEY = "oscars98_v3_votes";
const WINNERS_KEY = "oscars98_v3_winners";
const PLAYERS_KEY = "oscars98_v3_players";

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${DARK}; color: #e8dcc8; font-family: 'Cormorant Garamond', serif; min-height: 100vh; }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background:
      radial-gradient(ellipse at 20% 0%, rgba(201,168,76,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(201,168,76,0.06) 0%, transparent 50%),
      ${DARK};
  }

  .hero {
    width: 100%;
    max-width: 920px;
    padding: 60px 24px 44px;
    text-align: center;
    border-bottom: 1px solid rgba(201,168,76,0.2);
    background: linear-gradient(to bottom, rgba(201,168,76,0.05), transparent);
  }
  .hero::before {
    content: '◆ ◆ ◆';
    display: block;
    color: ${GOLD};
    font-size: 11px;
    letter-spacing: 8px;
    margin-bottom: 20px;
    opacity: 0.6;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 6vw, 58px);
    font-weight: 700;
    color: ${GOLD};
    letter-spacing: 0.04em;
    line-height: 1.1;
    text-shadow: 0 0 60px rgba(201,168,76,0.3);
  }
  .hero h1 span {
    display: block;
    font-size: 0.42em;
    font-weight: 400;
    font-style: italic;
    color: #c8b88a;
    letter-spacing: 0.18em;
    margin-bottom: 10px;
  }
  .hero p { margin-top: 14px; font-size: 17px; color: #8a7a5a; letter-spacing: 0.08em; font-weight: 300; }

  .section { width: 100%; max-width: 920px; padding: 40px 24px 80px; }

  .card { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,168,76,0.15); padding: 36px; margin-bottom: 16px; }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase;
    color: ${GOLD}; margin-bottom: 24px; padding-bottom: 14px;
    border-bottom: 1px solid rgba(201,168,76,0.15);
  }

  .emoji-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 28px; }
  .emoji-btn {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.2);
    padding: 14px; font-size: 28px; cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .emoji-btn:hover { background: rgba(201,168,76,0.1); border-color: ${GOLD}; transform: scale(1.05); }
  .emoji-btn.selected { background: rgba(201,168,76,0.15); border-color: ${GOLD}; box-shadow: 0 0 14px rgba(201,168,76,0.2); }

  .btn {
    background: transparent; border: 1px solid ${GOLD}; color: ${GOLD};
    font-family: 'Cormorant Garamond', serif; font-size: 17px;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 14px 32px; cursor: pointer; transition: all 0.2s; width: 100%;
  }
  .btn:hover { background: rgba(201,168,76,0.1); }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn.solid { background: ${GOLD}; color: ${DARK}; font-weight: 700; }
  .btn.solid:hover { background: #dbb85c; }

  .btn-sm {
    background: transparent; border: 1px solid rgba(201,168,76,0.4); color: #c8b88a;
    font-family: 'Cormorant Garamond', serif; font-size: 14px;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 8px 18px; cursor: pointer; transition: all 0.2s;
  }
  .btn-sm:hover { border-color: ${GOLD}; color: ${GOLD}; }

  .category-block { margin-bottom: 36px; padding-bottom: 36px; border-bottom: 1px solid rgba(201,168,76,0.08); }
  .category-name { font-family: 'Playfair Display', serif; font-size: 21px; color: ${GOLD}; margin-bottom: 16px; font-style: italic; }

  .nominee-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 20px; margin-bottom: 8px;
    border: 1px solid rgba(201,168,76,0.08);
    transition: all 0.18s; cursor: pointer;
    background: rgba(255,255,255,0.01); min-height: 56px;
  }
  .nominee-row:hover { background: rgba(201,168,76,0.06); border-color: rgba(201,168,76,0.25); }
  .nominee-row.winner-highlight { background: rgba(201,168,76,0.12); border-color: ${GOLD}; }
  .nominee-name { font-size: 18px; color: #d4c4a0; flex: 1; line-height: 1.35; }
  .vote-indicators { display: flex; gap: 6px; font-size: 26px; margin-left: 14px; flex-shrink: 0; }

  .players-bar {
    display: flex; gap: 16px; margin-bottom: 32px; padding: 22px;
    background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.12);
  }
  .player-badge { display: flex; align-items: center; gap: 14px; flex: 1; }
  .player-emoji { font-size: 36px; }
  .player-info { font-size: 15px; color: #8a7a5a; letter-spacing: 0.05em; }
  .player-name { color: #c8b88a; font-size: 20px; }

  .tab-bar { display: flex; border-bottom: 1px solid rgba(201,168,76,0.2); margin-bottom: 36px; }
  .tab {
    background: transparent; border: none; color: #6a5a3a;
    font-family: 'Cormorant Garamond', serif; font-size: 16px;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 14px 28px; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.2s; margin-bottom: -1px;
  }
  .tab:hover { color: #c8b88a; }
  .tab.active { color: ${GOLD}; border-bottom-color: ${GOLD}; }

  .score-board { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px; }
  .score-card { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.2); padding: 30px; text-align: center; }
  .score-number { font-family: 'Playfair Display', serif; font-size: 76px; color: ${GOLD}; line-height: 1; }
  .score-label { font-size: 15px; letter-spacing: 0.2em; color: #8a7a5a; text-transform: uppercase; margin-top: 10px; }

  .winner-banner {
    text-align: center; padding: 38px;
    background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04));
    border: 1px solid ${GOLD}; margin-bottom: 36px;
  }
  .winner-banner h2 { font-family: 'Playfair Display', serif; font-size: 38px; color: ${GOLD}; }
  .winner-banner p { color: #c8b88a; margin-top: 10px; font-style: italic; font-size: 19px; }

  .divider { text-align: center; color: rgba(201,168,76,0.3); letter-spacing: 12px; font-size: 11px; margin: 36px 0; }

  .admin-section { margin-top: 56px; padding-top: 36px; border-top: 1px solid rgba(201,168,76,0.1); }
  .admin-toggle {
    background: transparent; border: none; color: rgba(201,168,76,0.2);
    font-size: 13px; letter-spacing: 0.2em; cursor: pointer;
    text-transform: uppercase; font-family: 'Cormorant Garamond', serif;
  }
  .admin-toggle:hover { color: rgba(201,168,76,0.5); }

  input[type="text"], input[type="password"] {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.2);
    color: #e8dcc8; font-family: 'Cormorant Garamond', serif;
    font-size: 18px; padding: 12px 18px; width: 100%; outline: none;
  }
  input:focus { border-color: rgba(201,168,76,0.5); }

  .status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${GOLD}; display: inline-block; margin-right: 8px;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .progress-bar { height: 2px; background: rgba(201,168,76,0.1); margin-bottom: 36px; }
  .progress-fill { height: 100%; background: linear-gradient(to right, rgba(201,168,76,0.3), ${GOLD}); transition: width 0.5s; }

  .sync-status { text-align: center; font-size: 14px; color: #6a5a3a; letter-spacing: 0.1em; margin-bottom: 20px; }

  .slot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 30px; }
  .slot-btn {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(201,168,76,0.2);
    padding: 26px 16px; cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .slot-btn:hover:not(:disabled) { background: rgba(201,168,76,0.08); border-color: ${GOLD}; }
  .slot-btn.selected { background: rgba(201,168,76,0.12); border-color: ${GOLD}; box-shadow: 0 0 18px rgba(201,168,76,0.15); }
  .slot-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .result-row { margin-bottom: 18px; padding: 20px 22px; background: rgba(255,255,255,0.01); border: 1px solid rgba(201,168,76,0.08); }
  .compare-row { margin-bottom: 16px; padding: 18px 20px; border: 1px solid rgba(201,168,76,0.06); }
  .compare-row.agree { background: rgba(201,168,76,0.04); border-color: rgba(201,168,76,0.2); }

  .back-btn {
    background: transparent; border: 1px solid rgba(201,168,76,0.4); color: #c8b88a;
    font-family: 'Cormorant Garamond', serif; font-size: 14px;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 8px 18px; cursor: pointer; transition: all 0.2s;
    margin-bottom: 30px; display: inline-block;
  }
  .back-btn:hover { border-color: ${GOLD}; color: ${GOLD}; }

  .reset-btn {
    background: transparent; border: 1px solid rgba(220, 53, 69, 0.4); color: #eea7a7;
    font-family: 'Cormorant Garamond', serif; font-size: 14px;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 8px 18px; cursor: pointer; transition: all 0.2s;
    margin-top: 15px; width: 100%;
  }
  .reset-btn:hover { border-color: #dc3545; color: #dc3545; background: rgba(220, 53, 69, 0.05); }

  .edit-icon {
    margin-left: 10px;
    cursor: pointer;
    font-size: 18px; /* Slightly larger */
    color: ${GOLD}; /* Full gold color */
    transition: transform 0.2s, color 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 0 10px rgba(201,168,76,0.3);
  }
  .edit-icon:hover { 
    transform: scale(1.2);
    color: #dbb85c;
  }

  .profile-editor {
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.2);
    padding: 24px;
    margin-bottom: 24px;
    animation: slideDown 0.3s ease-out;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .score-board { grid-template-columns: 1fr; }
    .emoji-grid { grid-template-columns: repeat(4, 1fr); }
    .players-bar { flex-direction: column; }
    .slot-grid { grid-template-columns: 1fr; }
    .tab { padding: 12px 16px; font-size: 14px; }
  }
`;

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function OscarsApp() {
  const [phase, setPhase] = useState("setup");
  const [mySlot, setMySlot] = useState(() => localStorage.getItem("oscars_myslot"));
  const [myEmoji, setMyEmoji] = useState(null);
  const [myName, setMyName] = useState("");
  const [players, setPlayers] = useState({ p1: null, p2: null });
  const [votes, setVotes] = useState({});
  const [winners, setWinners] = useState({});
  const [activeTab, setActiveTab] = useState("votar");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingEmoji, setEditingEmoji] = useState(null);

  const syncFromCloud = useCallback(async () => {
    const [v, w, p] = await Promise.all([
      storageGet(VOTES_KEY),
      storageGet(WINNERS_KEY),
      storageGet(PLAYERS_KEY),
    ]);
    if (v) setVotes(v);
    if (w) setWinners(w);
    if (p) setPlayers(p);
    setLastSync(new Date().toLocaleTimeString("es-AR"));
  }, []);

  useEffect(() => {
    if (mySlot) {
      localStorage.setItem("oscars_myslot", mySlot);
    }
  }, [mySlot]);

  useEffect(() => {
    syncFromCloud();
    const interval = setInterval(syncFromCloud, 4000);
    return () => clearInterval(interval);
  }, [syncFromCloud]);

  async function registerPlayer() {
    if (!myEmoji || !myName.trim() || !mySlot) return;
    const updated = { ...players, [mySlot]: { emoji: myEmoji, name: myName.trim() } };
    setPlayers(updated);
    await storageSet(PLAYERS_KEY, updated);
    setPhase("voting");
  }

  async function updateProfile() {
    if (!editingEmoji || !editingName.trim() || !mySlot) return;
    const updated = { ...players, [mySlot]: { emoji: editingEmoji, name: editingName.trim() } };
    setPlayers(updated);
    await storageSet(PLAYERS_KEY, updated);
    setIsEditingProfile(false);
  }

  function startEditing() {
    if (!mySlot || !players[mySlot]) return;
    setEditingName(players[mySlot].name);
    setEditingEmoji(players[mySlot].emoji);
    setIsEditingProfile(true);
  }

  async function castVote(catId, nominee) {
    if (!mySlot) return;
    const current = votes[catId]?.[mySlot];
    const newNom = current === nominee ? null : nominee;
    const updated = { ...votes, [catId]: { ...(votes[catId] || {}), [mySlot]: newNom } };
    setVotes(updated);
    await storageSet(VOTES_KEY, updated);
  }

  const [resetConfirm, setResetConfirm] = useState(false);

  async function resetVotes() {
    if (!mySlot || !players[mySlot]) return;
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }

    const updatedVotes = { ...votes };
    CATEGORIES.forEach(cat => {
      if (updatedVotes[cat.id]) {
        updatedVotes[cat.id] = { ...updatedVotes[cat.id] };
        delete updatedVotes[cat.id][mySlot];
      }
    });

    setVotes(updatedVotes);
    await storageSet(VOTES_KEY, updatedVotes);
    setResetConfirm(false);
    alert("Votos reiniciados correctamente.");
  }

  async function setWinner(catId, nominee) {
    const updated = { ...winners, [catId]: winners[catId] === nominee ? null : nominee };
    setWinners(updated);
    await storageSet(WINNERS_KEY, updated);
  }

  function calcScores() {
    let p1 = 0, p2 = 0;
    CATEGORIES.forEach(cat => {
      const w = winners[cat.id];
      if (!w) return;
      if (votes[cat.id]?.p1 === w) p1++;
      if (votes[cat.id]?.p2 === w) p2++;
    });
    return { p1, p2 };
  }

  const scores = calcScores();
  const votedCount = CATEGORIES.filter(c => votes[c.id]?.[mySlot]).length;
  const revealedCount = Object.keys(winners).filter(k => winners[k]).length;
  const p1 = players.p1;
  const p2 = players.p2;
  const otherSlot = mySlot === "p1" ? "p2" : "p1";

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* HERO */}
        <div className="hero">
          <h1>
            <span>98ª Edición · 2026</span>
            Academia de Artes y Ciencias Cinematográficas
          </h1>
          <p>Dolby Theatre · Hollywood · Domingo 15 de marzo de 2026</p>
        </div>

        <div className="section">
          <div className="sync-status">
            <span className="status-dot" />
            {lastSync ? `Sincronizado a las ${lastSync}` : "Conectando..."}
          </div>

          {/* ── SETUP ── */}
          {phase === "setup" && (
            <div className="card">
              <div className="card-title">Registrar Participante</div>
              <p style={{ fontSize: 18, color: "#8a7a5a", marginBottom: 22 }}>¿Quién sos?</p>

              <div className="slot-grid">
                {["p1", "p2"].map(slot => (
                  <button
                    key={slot}
                    className={`slot-btn ${mySlot === slot ? "selected" : ""}`}
                    onClick={() => setMySlot(slot)}
                  >
                    {players[slot] ? (
                      <>
                        <div style={{ fontSize: 38 }}>{players[slot].emoji}</div>
                        <div style={{ fontSize: 18, color: "#c8b88a", marginTop: 10 }}>
                          {players[slot].name}
                          {mySlot === slot && (
                            <span
                              className="edit-icon"
                              style={{ fontSize: 16, marginLeft: 6 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing();
                              }}
                            >
                              ✎
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 14, color: "#6a5a3a", marginTop: 6 }}>Ya registrado</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 38, opacity: 0.22 }}>?</div>
                        <div style={{ fontSize: 16, color: mySlot === slot ? GOLD : "#6a5a3a", marginTop: 10 }}>
                          Jugador {slot === "p1" ? "1" : "2"}
                        </div>
                        <div style={{ fontSize: 14, color: mySlot === slot ? GOLD : "#4a3a2a", marginTop: 6 }}>
                          {mySlot === slot ? "← Seleccionado" : "Disponible"}
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {mySlot && !players[mySlot] && (
                <>
                  <p style={{ fontSize: 16, color: "#8a7a5a", letterSpacing: "0.1em", marginBottom: 16 }}>Elegí tu emoji</p>
                  <div className="emoji-grid">
                    {EMOJIS.map(e => (
                      <button key={e} className={`emoji-btn ${myEmoji === e ? "selected" : ""}`} onClick={() => setMyEmoji(e)}>{e}</button>
                    ))}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo"
                      value={myName}
                      onChange={e => setMyName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && registerPlayer()}
                      maxLength={20}
                    />
                  </div>
                  <button className="btn solid" onClick={registerPlayer} disabled={!myEmoji || !myName.trim()}>
                    Comenzar a Votar →
                  </button>
                </>
              )}

              {mySlot && players[mySlot] && (
                <>
                  <button className="btn" onClick={() => setPhase("voting")}>Ir a votar →</button>
                  {resetConfirm ? (
                    <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                      <button className="reset-btn" style={{ marginTop: 0, flex: 2 }} onClick={resetVotes}>Confirmar Borrado</button>
                      <button className="btn-sm" style={{ flex: 1 }} onClick={() => setResetConfirm(false)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="reset-btn" onClick={() => setResetConfirm(true)}>Reiniciar mis votos</button>
                  )}
                </>
              )}

              {!mySlot && (
                <p style={{ textAlign: "center", color: "#4a3a2a", fontSize: 17, marginTop: 10 }}>
                  Seleccioná tu lugar para continuar
                </p>
              )}
            </div>
          )}

          {/* ── MAIN APP ── */}
          {(phase === "voting" || phase === "results") && (
            <>
              <button className="back-btn" onClick={() => setPhase("setup")}>← Volver</button>
              {/* Players bar */}
              {(p1 || p2) && (
                <div className="players-bar">
                  {[p1, p2].map((pl, i) => {
                    const slot = i === 0 ? "p1" : "p2";
                    const isMe = mySlot === slot;
                    return pl ? (
                      <div key={i} className="player-badge">
                        <span className="player-emoji">{pl.emoji}</span>
                        <div>
                          <div className="player-name">{pl.name}</div>
                          <div className="player-info">Jugador {i + 1}</div>
                        </div>
                        {revealedCount > 0 && (
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, color: GOLD, lineHeight: 1 }}>
                              {i === 0 ? scores.p1 : scores.p2}
                            </div>
                            <div style={{ fontSize: 13, color: "#6a5a3a", letterSpacing: "0.1em" }}>aciertos</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div key={i} className="player-badge">
                        <span className="player-emoji" style={{ opacity: 0.2 }}>?</span>
                        <div>
                          <div className="player-name" style={{ color: "#3a2a1a" }}>Esperando...</div>
                          <div className="player-info">Jugador {i + 1}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Profile Editor */}
              {isEditingProfile && (
                <div className="profile-editor">
                  <div className="card-title">Editar Perfil</div>
                  <div className="emoji-grid">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        className={`emoji-btn ${editingEmoji === e ? "selected" : ""}`}
                        onClick={() => setEditingEmoji(e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Tu nombre o apodo"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn solid" style={{ flex: 2 }} onClick={updateProfile}>Guardar Cambios</button>
                    <button className="btn" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="tab-bar">
                <button className={`tab ${activeTab === "votar" ? "active" : ""}`} onClick={() => setActiveTab("votar")}>Mis picks</button>
                <button className={`tab ${activeTab === "comparar" ? "active" : ""}`} onClick={() => setActiveTab("comparar")}>Comparar</button>
                {revealedCount > 0 && (
                  <button className={`tab ${activeTab === "resultados" ? "active" : ""}`} onClick={() => setActiveTab("resultados")}>Resultados</button>
                )}
              </div>

              {/* ── VOTAR ── */}
              {activeTab === "votar" && (
                <>
                  {mySlot && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(votedCount / CATEGORIES.length) * 100}%` }} />
                    </div>
                  )}
                  <p style={{ fontSize: 16, color: "#6a5a3a", letterSpacing: "0.08em", marginBottom: 30, textAlign: "center" }}>
                    {mySlot
                      ? `${votedCount} de ${CATEGORIES.length} categorías elegidas · Tocá un nominado para votar`
                      : "Regístrate primero para votar"}
                  </p>
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="category-block">
                      <div className="category-name">{cat.name}</div>
                      {cat.nominees.map(nom => {
                        const myVote = mySlot && votes[cat.id]?.[mySlot] === nom;
                        const otherVote = votes[cat.id]?.[otherSlot] === nom;
                        const isWinner = winners[cat.id] === nom;
                        return (
                          <div
                            key={nom}
                            className={`nominee-row ${isWinner ? "winner-highlight" : ""}`}
                            onClick={() => mySlot && castVote(cat.id, nom)}
                          >
                            <span className="nominee-name">{nom}</span>
                            <span className="vote-indicators">
                              {isWinner && <span>🏆</span>}
                              {myVote && mySlot && <span>{players[mySlot]?.emoji}</span>}
                              {otherVote && players[otherSlot] && <span>{players[otherSlot].emoji}</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}

              {/* ── COMPARAR ── */}
              {activeTab === "comparar" && (
                <>
                  <p style={{ fontSize: 16, color: "#6a5a3a", letterSpacing: "0.08em", marginBottom: 28, textAlign: "center" }}>
                    Picks de ambos participantes
                  </p>
                  {CATEGORIES.map(cat => {
                    const v1 = votes[cat.id]?.p1;
                    const v2 = votes[cat.id]?.p2;
                    const agree = v1 && v2 && v1 === v2;
                    return (
                      <div key={cat.id} className={`compare-row ${agree ? "agree" : ""}`}>
                        <div style={{ fontSize: 13, letterSpacing: "0.15em", color: "#6a5a3a", textTransform: "uppercase", marginBottom: 12 }}>
                          {cat.name} {agree && <span style={{ color: GOLD }}>· ✦ Coinciden</span>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                          <div>
                            <div style={{ fontSize: 14, color: "#4a3a2a", marginBottom: 6 }}>{p1?.emoji || "?"} {p1?.name || "J1"}</div>
                            <div style={{ fontSize: 17, color: v1 ? "#c8b88a" : "#3a2a1a", lineHeight: 1.35 }}>{v1 || "—"}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 14, color: "#4a3a2a", marginBottom: 6 }}>{p2?.emoji || "?"} {p2?.name || "J2"}</div>
                            <div style={{ fontSize: 17, color: v2 ? "#c8b88a" : "#3a2a1a", lineHeight: 1.35 }}>{v2 || "—"}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── RESULTADOS ── */}
              {activeTab === "resultados" && revealedCount > 0 && (
                <>
                  {revealedCount === CATEGORIES.length && (
                    <div className="winner-banner">
                      {scores.p1 > scores.p2 ? (
                        <><h2>{p1?.emoji} {p1?.name} ganó</h2><p>{scores.p1} vs {scores.p2} aciertos · ¡Felicitaciones!</p></>
                      ) : scores.p2 > scores.p1 ? (
                        <><h2>{p2?.emoji} {p2?.name} ganó</h2><p>{scores.p2} vs {scores.p1} aciertos · ¡Felicitaciones!</p></>
                      ) : (
                        <><h2>🤝 Empate</h2><p>{scores.p1} aciertos cada uno</p></>
                      )}
                    </div>
                  )}
                  <div className="score-board">
                    {[p1, p2].map((pl, i) => (
                      <div key={i} className="score-card">
                        <div style={{ fontSize: 42, marginBottom: 12 }}>{pl?.emoji || "?"}</div>
                        <div className="score-number">{i === 0 ? scores.p1 : scores.p2}</div>
                        <div className="score-label">{pl?.name || `Jugador ${i + 1}`}</div>
                      </div>
                    ))}
                  </div>
                  <div className="divider">◆ ◆ ◆</div>
                  {CATEGORIES.map(cat => {
                    const w = winners[cat.id];
                    if (!w) return null;
                    const p1hit = votes[cat.id]?.p1 === w;
                    const p2hit = votes[cat.id]?.p2 === w;
                    return (
                      <div key={cat.id} className="result-row">
                        <div style={{ fontSize: 13, letterSpacing: "0.15em", color: "#6a5a3a", textTransform: "uppercase", marginBottom: 10 }}>{cat.name}</div>
                        <div style={{ color: GOLD, fontSize: 18, marginBottom: 10, lineHeight: 1.3 }}>🏆 {w}</div>
                        <div style={{ display: "flex", gap: 24 }}>
                          {p1 && <span style={{ fontSize: 17, color: p1hit ? "#a0c878" : "#6a5a3a" }}>{p1.emoji} {p1hit ? "✓ acertó" : "✗"}</span>}
                          {p2 && <span style={{ fontSize: 17, color: p2hit ? "#a0c878" : "#6a5a3a" }}>{p2.emoji} {p2hit ? "✓ acertó" : "✗"}</span>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── ADMIN ── */}
              <div className="admin-section">
                <button className="admin-toggle" onClick={() => setAdminOpen(!adminOpen)}>
                  · · · panel de resultados · · ·
                </button>

                {adminOpen && !adminAuth && (
                  <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                    <input
                      type="password"
                      placeholder="Contraseña de admin"
                      value={adminPass}
                      onChange={e => setAdminPass(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && adminPass === ADMIN_PASSWORD && setAdminAuth(true)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn-sm" onClick={() => adminPass === ADMIN_PASSWORD && setAdminAuth(true)}>
                      Ingresar
                    </button>
                  </div>
                )}

                {adminOpen && adminAuth && (
                  <div style={{ marginTop: 28 }}>
                    <div style={{ fontSize: 14, letterSpacing: "0.2em", color: GOLD, marginBottom: 20, textTransform: "uppercase" }}>
                      Cargá los ganadores reales — 15 de marzo de 2026
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
                      <button
                        className="btn-sm"
                        style={{ borderColor: "rgba(200,80,80,0.4)", color: "#c87878" }}
                        onClick={async () => {
                          await Promise.all([
                            storageSet(VOTES_KEY, {}),
                            storageSet(WINNERS_KEY, {}),
                            storageSet(PLAYERS_KEY, { p1: null, p2: null }),
                          ]);
                          setVotes({}); setWinners({}); setPlayers({ p1: null, p2: null });
                          setPhase("setup"); setMySlot(null); setMyEmoji(null); setMyName("");
                        }}
                      >Reset completo</button>
                      <button
                        className="btn-sm"
                        style={{ borderColor: "rgba(200,80,80,0.4)", color: "#c87878" }}
                        onClick={async () => { await storageSet(WINNERS_KEY, {}); setWinners({}); }}
                      >Limpiar ganadores</button>
                    </div>
                    {CATEGORIES.map(cat => (
                      <div key={cat.id} style={{ marginBottom: 26 }}>
                        <div style={{ fontSize: 13, letterSpacing: "0.12em", color: "#8a7a5a", textTransform: "uppercase", marginBottom: 10 }}>
                          {cat.name}
                          {winners[cat.id] && <span style={{ color: GOLD }}> · ✓ {winners[cat.id].substring(0, 40)}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {cat.nominees.map(nom => (
                            <button
                              key={nom}
                              className="btn-sm"
                              style={winners[cat.id] === nom ? { borderColor: GOLD, color: GOLD } : {}}
                              onClick={() => setWinner(cat.id, nom)}
                            >
                              {nom.substring(0, 38)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
