import { useState, useEffect, useCallback, useMemo } from "react";
import { storageGet, storageSet } from "../lib/supabase";
import {
  CATEGORIES,
  VOTES_KEY,
  WINNERS_KEY,
  PLAYERS_KEY,
  VOTING_DEADLINE,
} from "../lib/constants";
import "../styles/oscars.css";

// Sub-components
import PlayerHeader from "./oscars/PlayerHeader";
import SetupPhase from "./oscars/SetupPhase";
import ProfileEditor from "./oscars/ProfileEditor";
import VotingTab from "./oscars/VotingTab";
import CompareTab from "./oscars/CompareTab";
import ResultsTab from "./oscars/ResultsTab";

// ─────────────────────────────────────────────
// Helper: normaliza winners legacy (string) → arrays
// Asegura retrocompatibilidad con datos guardados antes del empate
const normalizeWinners = (raw) => {
  if (!raw) return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === null || v === undefined) out[k] = null;
    else if (Array.isArray(v)) out[k] = v;
    else out[k] = [v]; // migra string antiguo → array de 1 elemento
  }
  return out;
};

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function OscarsApp({ slot, setAdminOpen }) {
  const [phase, setPhase] = useState("setup");
  const [mySlot, setMySlot] = useState(slot ?? null);
  const [myEmoji, setMyEmoji] = useState(null);
  const [myName, setMyName] = useState("");
  const [players, setPlayers] = useState({ p1: null, p2: null });
  const [votes, setVotes] = useState({});
  const [winners, setWinners] = useState({});
  const [activeTab, setActiveTab] = useState("votar");
  const [lastSync, setLastSync] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingEmoji, setEditingEmoji] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const isVotingClosed = useMemo(() => {
    return new Date() > new Date(VOTING_DEADLINE);
  }, []);

  const syncFromCloud = useCallback(async () => {
    const [v, w, p] = await Promise.all([
      storageGet(VOTES_KEY),
      storageGet(WINNERS_KEY),
      storageGet(PLAYERS_KEY),
    ]);
    if (v) setVotes(v);
    if (w) setWinners(normalizeWinners(w)); // normaliza formato legacy
    if (p) setPlayers(p);
    setLastSync(new Date().toLocaleTimeString("es-AR"));
  }, []);

  // Slot now comes from Supabase Auth (user_slots table) via App.jsx.
  // No localStorage persistence needed.

  useEffect(() => {
    syncFromCloud();
    const interval = setInterval(syncFromCloud, 4000);
    return () => clearInterval(interval);
  }, [syncFromCloud]);

  const registerPlayer = async () => {
    if (!myEmoji || !myName.trim() || !mySlot) return;
    const updated = { ...players, [mySlot]: { emoji: myEmoji, name: myName.trim() } };
    setPlayers(updated);
    await storageSet(PLAYERS_KEY, updated);
    setPhase("voting");
  };

  const updateProfile = async () => {
    if (!editingEmoji || !editingName.trim() || !mySlot) return;
    const updated = { ...players, [mySlot]: { emoji: editingEmoji, name: editingName.trim() } };
    setPlayers(updated);
    await storageSet(PLAYERS_KEY, updated);
    setIsEditingProfile(false);
  };

  const startEditing = () => {
    if (!mySlot || !players[mySlot]) return;
    setEditingName(players[mySlot].name);
    setEditingEmoji(players[mySlot].emoji);
    setIsEditingProfile(true);
  };

  const castVote = async (catId, nominee) => {
    if (!mySlot || isVotingClosed) return;
    const current = votes[catId]?.[mySlot];
    const newNom = current === nominee ? null : nominee;
    const updated = { ...votes, [catId]: { ...(votes[catId] || {}), [mySlot]: newNom } };
    setVotes(updated);
    await storageSet(VOTES_KEY, updated);
  };

  const resetVotes = async () => {
    if (!mySlot || !players[mySlot] || isVotingClosed) return;
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }

    const updatedVotes = { ...votes };
    CATEGORIES.forEach((cat) => {
      if (updatedVotes[cat.id]) {
        updatedVotes[cat.id] = { ...updatedVotes[cat.id] };
        delete updatedVotes[cat.id][mySlot];
      }
    });

    setVotes(updatedVotes);
    await storageSet(VOTES_KEY, updatedVotes);
    setResetConfirm(false);
    alert("Votos reiniciados correctamente.");
  };

  const scores = useMemo(() => {
    let p1 = 0, p2 = 0;
    CATEGORIES.forEach((cat) => {
      const winArr = winners[cat.id];          // array o null
      if (!winArr || winArr.length === 0) return;
      if (winArr.includes(votes[cat.id]?.p1)) p1++; // acierto si el voto está en el array
      if (winArr.includes(votes[cat.id]?.p2)) p2++;
    });
    return { p1, p2 };
  }, [winners, votes]);

  const votedCount = useMemo(() => {
    if (!mySlot) return 0;
    return CATEGORIES.filter((c) => votes[c.id]?.[mySlot]).length;
  }, [votes, mySlot]);

  const revealedCount = useMemo(() => {
    return Object.keys(winners).filter((k) => winners[k]?.length > 0).length;
  }, [winners]);

  const otherSlot = mySlot === "p1" ? "p2" : "p1";

  return (
    <div className="app">
      {/* HERO */}
      <div className="hero">
        <h1>
          <span
            onClick={() => setAdminOpen(true)}
            style={{ cursor: "pointer" }}
            title="Panel de Administración"
          >
            98ª Edición · 2026
          </span>
          Academia de Artes y Ciencias Cinematográficas
        </h1>
        <p>Dolby Theatre · Hollywood · Domingo 15 de marzo de 2026</p>
      </div>

      {isVotingClosed && (
        <div className="deadline-banner">
          <span className="banner-icon">🔒</span>
          Votaciones cerradas. La ceremonia ha comenzado o finalizado.
        </div>
      )}


      <div className="section">
        <div className="sync-status">
          <span className="status-dot" />
          {lastSync ? `Sincronizado a las ${lastSync}` : "Conectando..."}
        </div>

        {/* ── SETUP ── */}
        {isEditingProfile ? (
          <ProfileEditor
            editingEmoji={editingEmoji}
            setEditingEmoji={setEditingEmoji}
            editingName={editingName}
            setEditingName={setEditingName}
            updateProfile={updateProfile}
            setIsEditingProfile={setIsEditingProfile}
            players={players}
            mySlot={mySlot}
          />
        ) : (
          <>
            {/* ── SETUP ── */}
            {phase === "setup" && (
              <SetupPhase
                mySlot={mySlot}
                setMySlot={setMySlot}
                players={players}
                myEmoji={myEmoji}
                setMyEmoji={setMyEmoji}
                myName={myName}
                setMyName={setMyName}
                registerPlayer={registerPlayer}
                setPhase={setPhase}
                resetConfirm={resetConfirm}
                setResetConfirm={setResetConfirm}
                resetVotes={resetVotes}
                startEditing={startEditing}
                isVotingClosed={isVotingClosed}
              />
            )}

            {/* ── MAIN APP ── */}
            {(phase === "voting" || phase === "results") && (
              <>
                <button className="back-btn" onClick={() => setPhase("setup")}>
                  ← Volver
                </button>

                <PlayerHeader
                  p1={players.p1}
                  p2={players.p2}
                  mySlot={mySlot}
                  scores={scores}
                  revealedCount={revealedCount}
                />

                {/* Tabs */}
                <div className="tab-bar">
                  <button
                    className={`tab ${activeTab === "votar" ? "active" : ""}`}
                    onClick={() => setActiveTab("votar")}
                  >
                    Mis picks
                  </button>
                  <button
                    className={`tab ${activeTab === "comparar" ? "active" : ""}`}
                    onClick={() => setActiveTab("comparar")}
                  >
                    Comparar
                  </button>
                  {revealedCount > 0 && (
                    <button
                      className={`tab ${activeTab === "resultados" ? "active" : ""}`}
                      onClick={() => setActiveTab("resultados")}
                    >
                      Resultados
                    </button>
                  )}
                </div>

                {activeTab === "votar" && (
                  <VotingTab
                    mySlot={mySlot}
                    votes={votes}
                    winners={winners}
                    players={players}
                    otherSlot={otherSlot}
                    castVote={castVote}
                    votedCount={votedCount}
                    isVotingClosed={isVotingClosed}
                  />
                )}

                {activeTab === "comparar" && <CompareTab votes={votes} p1={players.p1} p2={players.p2} />}

                {activeTab === "resultados" && (
                  <ResultsTab
                    scores={scores}
                    p1={players.p1}
                    p2={players.p2}
                    winners={winners}
                    votes={votes}
                    revealedCount={revealedCount}
                  />
                )}

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
