import React, { useState, useEffect, useCallback } from "react";
import { CATEGORIES, GOLD, ADMIN_PASSWORD, WINNERS_KEY, VOTES_KEY, PLAYERS_KEY } from "../../lib/constants";
import { storageGet, storageSet } from "../../lib/supabase";
import { logger } from "../../lib/logger";

const AdminPanel = ({ adminOpen, setAdminOpen }) => {
    const [adminAuth, setAdminAuth] = useState(false);
    const [adminPass, setAdminPass] = useState("");
    const [winners, setWinners] = useState({});
    const [localResetConfirm, setLocalResetConfirm] = useState(false);
    const [localClearConfirm, setLocalClearConfirm] = useState(false);

    // STEP 1: New states for password UX
    const [passwordError, setPasswordError] = useState(false);   // shows error message
    const [showPassword, setShowPassword] = useState(false);     // toggles eye icon

    const syncWinners = useCallback(async () => {
        if (!adminOpen || !adminAuth) return;
        const w = await storageGet(WINNERS_KEY);
        if (w) setWinners(w);
    }, [adminOpen, adminAuth]);

    useEffect(() => {
        syncWinners();
        const interval = setInterval(syncWinners, 4000);
        return () => clearInterval(interval);
    }, [syncWinners]);

    // STEP 2: Centralized auth handler — replaces inline logic
    const handleAuth = () => {
        if (adminPass === ADMIN_PASSWORD) {
            setAdminAuth(true);
            setPasswordError(false); // clear any previous error
        } else {
            setPasswordError(true);  // show error message
            setAdminPass("");        // clear the input for retry
        }
    };

    const setWinner = async (catId, nominee) => {
        const updated = { ...winners, [catId]: winners[catId] === nominee ? null : nominee };
        setWinners(updated);
        await storageSet(WINNERS_KEY, updated);
    };

    const resetAll = async () => {
        try {
            await Promise.all([
                storageSet(VOTES_KEY, {}),
                storageSet(WINNERS_KEY, {}),
                storageSet(PLAYERS_KEY, { p1: null, p2: null }),
            ]);
            setWinners({});
            setLocalResetConfirm(false);
            alert("Aplicación reiniciada globalmente.");
            window.location.reload();
        } catch (error) {
            logger.error("AdminPanel: resetAll failed:", error);
            alert("Error al reiniciar la aplicación.");
        }
    };

    const clearWinners = async () => {
        try {
            await storageSet(WINNERS_KEY, {});
            setWinners({});
            setLocalClearConfirm(false);
            alert("Ganadores limpiados correctamente.");
        } catch (error) {
            logger.error("AdminPanel: clearWinners failed:", error);
            alert("Error al limpiar ganadores.");
        }
    };

    if (!adminOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === "admin-modal-overlay") {
            setAdminOpen(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={handleOverlayClick}>
            <div className="admin-modal-content">
                <button className="admin-close-btn" onClick={() => setAdminOpen(false)}>
                    ×
                </button>
                <div className="admin-section">
                    {!adminAuth && (
                        <>
                            <div style={{
                                fontSize: 18,
                                letterSpacing: "0.15em",
                                color: GOLD,
                                marginBottom: 20,
                                textAlign: "center",
                                textTransform: "uppercase",
                            }}>
                                Panel de Resultados
                            </div>

                            {/* STEP 3: Input row with eye icon inside the field */}
                            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>

                                {/* Wrapper positions the eye icon absolutely inside the input */}
                                <div style={{ flex: 1, position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"} // toggles visibility
                                        placeholder="Contraseña de admin"
                                        value={adminPass}
                                        onChange={(e) => {
                                            setAdminPass(e.target.value);
                                            setPasswordError(false); // clear error while typing
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                                        style={{ width: "100%", paddingRight: 36, boxSizing: "border-box" }}
                                    />

                                    {/* STEP 4: Eye icon button — toggles showPassword */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            color: showPassword ? GOLD : "#666",
                                            fontSize: 16,
                                            lineHeight: 1,
                                        }}
                                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        {/* Eye open / Eye closed SVG icons */}
                                        {showPassword ? (
                                            // Eye-off icon (password visible → click to hide)
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            // Eye icon (password hidden → click to show)
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <button
                                    className="btn-sm"
                                    onClick={handleAuth} // uses centralized handler
                                >
                                    Ingresar
                                </button>
                            </div>

                            {/* STEP 5: Error message — only shows when passwordError is true */}
                            {passwordError && (
                                <div style={{
                                    marginTop: 10,
                                    fontSize: 12,
                                    letterSpacing: "0.08em",
                                    color: "#c87878",
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                }}>
                                    Contraseña incorrecta. Intentá de nuevo.
                                </div>
                            )}
                        </>
                    )}

                    {adminAuth && (
                        <div style={{ marginTop: 28 }}>
                            <div
                                style={{
                                    fontSize: 14,
                                    letterSpacing: "0.2em",
                                    color: GOLD,
                                    marginBottom: 20,
                                    textTransform: "uppercase",
                                }}
                            >
                                Cargá los ganadores reales — 15 de marzo de 2026
                            </div>
                            <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap", alignItems: "center" }}>
                                {!localResetConfirm ? (
                                    <button
                                        className="btn-sm"
                                        style={{ borderColor: "rgba(200,80,80,0.6)", color: "#ee9999", fontSize: "12px" }}
                                        onClick={() => setLocalResetConfirm(true)}
                                    >
                                        Reset completo
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button
                                            className="btn-sm"
                                            style={{ background: "#822", color: "white", borderColor: "#f66", fontSize: "12px" }}
                                            onClick={resetAll}
                                        >
                                            Confirmar Reset
                                        </button>
                                        <button
                                            className="btn-sm"
                                            style={{ borderColor: "#666", color: "#999", fontSize: "12px" }}
                                            onClick={() => setLocalResetConfirm(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}

                                {!localClearConfirm ? (
                                    <button
                                        className="btn-sm"
                                        style={{ borderColor: "rgba(200,80,80,0.4)", color: "#c87878", fontSize: "12px" }}
                                        onClick={() => setLocalClearConfirm(true)}
                                    >
                                        Limpiar ganadores
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button
                                            className="btn-sm"
                                            style={{ background: "#644", color: "white", borderColor: "#c88", fontSize: "12px" }}
                                            onClick={clearWinners}
                                        >
                                            Confirmar Limpiar
                                        </button>
                                        <button
                                            className="btn-sm"
                                            style={{ borderColor: "#666", color: "#999", fontSize: "12px" }}
                                            onClick={() => setLocalClearConfirm(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                            {CATEGORIES.map((cat) => (
                                <div key={cat.id} style={{ marginBottom: 26 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            letterSpacing: "0.12em",
                                            color: "#8a7a5a",
                                            textTransform: "uppercase",
                                            marginBottom: 10,
                                        }}
                                    >
                                        {cat.name}
                                        {winners[cat.id] && (
                                            <span style={{ color: GOLD }}> · ✓ {winners[cat.id].substring(0, 40)}</span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {cat.nominees.map((nom) => (
                                            <button
                                                key={nom}
                                                className={`btn-sm ${winners[cat.id] === nom ? "winner-selected" : ""}`}
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
            </div>
        </div>
    );
};

export default React.memo(AdminPanel);
