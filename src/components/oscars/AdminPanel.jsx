import React, { useState, useEffect, useCallback } from "react";
import { CATEGORIES, GOLD, ADMIN_PASSWORD, WINNERS_KEY, VOTES_KEY, PLAYERS_KEY } from "../../lib/constants";
import { storageGet, storageSet } from "../../lib/supabase";

const AdminPanel = ({ adminOpen, setAdminOpen }) => {
    const [adminAuth, setAdminAuth] = useState(false);
    const [adminPass, setAdminPass] = useState("");
    const [winners, setWinners] = useState({});
    const [localResetConfirm, setLocalResetConfirm] = useState(false);
    const [localClearConfirm, setLocalClearConfirm] = useState(false);

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

    const setWinner = async (catId, nominee) => {
        const updated = { ...winners, [catId]: winners[catId] === nominee ? null : nominee };
        setWinners(updated);
        await storageSet(WINNERS_KEY, updated);
    };

    const resetAll = async () => {
        console.log("AdminPanel: Executing resetAll...");
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
            console.error("AdminPanel: resetAll failed:", error);
            alert("Error al reiniciar la aplicación.");
        }
    };

    const clearWinners = async () => {
        console.log("AdminPanel: Executing clearWinners...");
        try {
            await storageSet(WINNERS_KEY, {});
            setWinners({});
            setLocalClearConfirm(false);
            alert("Ganadores limpiados correctamente.");
        } catch (error) {
            console.error("AdminPanel: clearWinners failed:", error);
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
                            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                                <input
                                    type="password"
                                    placeholder="Contraseña de admin"
                                    value={adminPass}
                                    onChange={(e) => setAdminPass(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && adminPass === ADMIN_PASSWORD && setAdminAuth(true)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    className="btn-sm"
                                    onClick={() => adminPass === ADMIN_PASSWORD && setAdminAuth(true)}
                                >
                                    Ingresar
                                </button>
                            </div>
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
