import React from "react";
import { CATEGORIES, GOLD, ADMIN_PASSWORD } from "../../lib/constants";

const AdminPanel = ({
    adminOpen,
    setAdminOpen,
    adminAuth,
    setAdminAuth,
    adminPass,
    setAdminPass,
    winners,
    setWinner,
    resetAll,
    clearWinners,
}) => {
    return (
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
            )}

            {adminOpen && adminAuth && (
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
                    <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
                        <button
                            className="btn-sm"
                            style={{ borderColor: "rgba(200,80,80,0.4)", color: "#c87878" }}
                            onClick={resetAll}
                        >
                            Reset completo
                        </button>
                        <button
                            className="btn-sm"
                            style={{ borderColor: "rgba(200,80,80,0.4)", color: "#c87878" }}
                            onClick={clearWinners}
                        >
                            Limpiar ganadores
                        </button>
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
    );
};

export default React.memo(AdminPanel);
