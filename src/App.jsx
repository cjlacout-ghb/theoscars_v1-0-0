import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LoginScreen from './LoginScreen';
import OscarsApp from './components/oscars2026.jsx';
import AdminPanel from './components/oscars/AdminPanel';

export default function App() {
  // null  = still loading session
  // false = no session (show login)
  // true  = authenticated
  const [sessionReady, setSessionReady] = useState(null);
  const [slot, setSlot] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  // ── Fetch the slot for a given user_id ──────────────────────────────────
  const fetchSlot = async (userId) => {
    const { data, error } = await supabase
      .from('user_slots')
      .select('slot')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('fetchSlot error:', error);
      return null;
    }
    return data?.slot ?? null;
  };

  // ── On mount: restore existing session ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const userSlot = await fetchSlot(session.user.id);
        setSlot(userSlot);
        setSessionReady(true);
      } else {
        setSessionReady(false);
      }
    });

    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setSlot(null);
          setSessionReady(false);
        }
        // SIGNED_IN is handled by handleLogin; TOKEN_REFRESHED keeps existing slot
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Called by LoginScreen after successful login + slot assignment ───────
  const handleLogin = (assignedSlot) => {
    setSlot(assignedSlot);
    setSessionReady(true);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSlot(null);
    setSessionReady(false);
  };

  // ── Loading shimmer while we check the session ───────────────────────────
  if (sessionReady === null) {
    return (
      <div className="app session-loading">
        <div className="session-loading-inner">
          <span className="session-ornament">◆</span>
          <p>Verificando sesión…</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!sessionReady) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} setAdminOpen={setAdminOpen} />
        <AdminPanel adminOpen={adminOpen} setAdminOpen={setAdminOpen} />
      </>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Logout button — always visible while authenticated */}
      <div className="logout-bar">
        <button
          id="logout-btn"
          className="logout-btn"
          onClick={handleLogout}
        >
          Finalizar Turno <br /> (Cambiar Jugador)
        </button>
      </div>
      <OscarsApp slot={slot} setAdminOpen={setAdminOpen} />
      <AdminPanel adminOpen={adminOpen} setAdminOpen={setAdminOpen} />
    </>
  );
}
