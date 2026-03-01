import React, { useState } from "react";
import { EMOJIS, GOLD } from "../../lib/constants";

const SetupPhase = ({
    mySlot,
    setMySlot,
    players,
    myEmoji,
    setMyEmoji,
    myName,
    setMyName,
    registerPlayer,
    setPhase,
    resetConfirm,
    setResetConfirm,
    resetVotes,
    startEditing,
}) => {
    const [savedName, setSavedName] = useState("");

    const handleSaveName = () => {
        if (myName.trim()) setSavedName(myName.trim());
    };

    const otherSlot = mySlot === "p1" ? "p2" : "p1";
    const otherPlayer = players[otherSlot];
    const isNameTaken = otherPlayer && myName.trim().toLowerCase() === otherPlayer.name.toLowerCase();

    return (
        <div className="card">
            <div className="card-title">Registrar Participante</div>
            <p style={{ fontSize: 20, color: "#8a7a5a", marginBottom: 12 }}>¿Quién sos?</p>

            <div className="slot-grid">
                {["p1", "p2"].map((slot) => (
                    <button
                        key={slot}
                        className={`slot-btn ${mySlot === slot ? "selected" : ""}`}
                        onClick={() => setMySlot(slot)}
                        disabled={mySlot !== slot}
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
                                <div style={{ fontSize: 16, color: "#6a5a3a", marginTop: 6 }}>Ya registrado</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: 42, opacity: mySlot === slot && myEmoji ? 1 : 0.35, color: "#c9a84c" }}>
                                    {mySlot === slot && myEmoji ? myEmoji : "?"}
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        color: mySlot === slot ? GOLD : "#8a7a5a",
                                        marginTop: 10,
                                    }}
                                >
                                    {mySlot === slot && savedName ? savedName : `Jugador ${slot === "p1" ? "1" : "2"}`}
                                </div>
                                <div
                                    style={{
                                        fontSize: 16,
                                        color: mySlot === slot ? GOLD : "#6a5a3a",
                                        marginTop: 6,
                                    }}
                                >
                                    {mySlot === slot ? "Seleccionar" : "Bloqueado"}
                                </div>
                            </>
                        )}
                    </button>
                ))}
            </div>

            {mySlot && !players[mySlot] && (
                <>
                    <p
                        style={{
                            fontSize: 18,
                            color: "#8a7a5a",
                            letterSpacing: "0.1em",
                            marginBottom: 16,
                        }}
                    >
                        Elegí tu emoji
                    </p>
                    <div className="emoji-grid">
                        {EMOJIS.map((e) => {
                            const isTaken = otherPlayer && otherPlayer.emoji === e;
                            return (
                                <button
                                    key={e}
                                    className={`emoji-btn ${myEmoji === e ? "selected" : ""}`}
                                    onClick={() => !isTaken && setMyEmoji(e)}
                                    disabled={isTaken}
                                    style={{
                                        opacity: isTaken ? 0.2 : 1,
                                        cursor: isTaken ? "not-allowed" : "pointer",
                                    }}
                                    title={isTaken ? "Ya elegido por el otro jugador" : ""}
                                >
                                    {e}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ marginBottom: 14, display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Tu nombre o apodo"
                            value={myName}
                            onChange={(e) => {
                                setMyName(e.target.value);
                                if (savedName && e.target.value.trim() !== savedName) {
                                    setSavedName(""); // reset if they start typing something else
                                }
                            }}
                            onKeyDown={(e) => e.key === "Enter" && !isNameTaken && handleSaveName()}
                            maxLength={20}
                            style={{
                                flex: 1,
                                borderColor: isNameTaken ? "#e07070" : undefined
                            }}
                        />
                        {myName.trim() && myName.trim() !== savedName && !isNameTaken && (
                            <button
                                onClick={handleSaveName}
                                title="Guardar nombre"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(201, 168, 76, 0.4)",
                                    color: "#c8b88a",
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "15px",
                                    letterSpacing: "0.08em",
                                    padding: "8px 16px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = "#c9a84c";
                                    e.target.style.color = "#c9a84c";
                                    e.target.style.background = "rgba(201, 168, 76, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = "rgba(201, 168, 76, 0.4)";
                                    e.target.style.color = "#c8b88a";
                                    e.target.style.background = "transparent";
                                }}
                            >
                                ✓ Listo
                            </button>
                        )}
                    </div>
                    {isNameTaken && (
                        <p style={{ color: "#e07070", fontSize: 14, marginTop: -10, marginBottom: 14, italic: true }}>
                            Este nombre ya está siendo usado
                        </p>
                    )}
                    <button
                        className="btn solid"
                        onClick={registerPlayer}
                        disabled={!myEmoji || !myName.trim() || isNameTaken}
                    >
                        Comenzar a Votar →
                    </button>
                </>
            )}

            {mySlot && players[mySlot] && (
                <>
                    <button className="btn" onClick={() => setPhase("voting")}>
                        Ir a votar →
                    </button>
                    {resetConfirm ? (
                        <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    className="reset-btn"
                                    style={{ marginTop: 0, flex: 2 }}
                                    onClick={resetVotes}
                                >
                                    Confirmar Borrado Picks
                                </button>
                                <button
                                    className="btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => setResetConfirm(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="reset-btn" onClick={() => setResetConfirm(true)}>
                            Reiniciar mis votos
                        </button>
                    )}
                </>
            )}

            {!mySlot && (
                <p style={{ textAlign: "center", color: "#8a7a5a", fontSize: 19, marginTop: 10, fontStyle: "italic", letterSpacing: "0.05em" }}>
                    Cargando tu lugar...
                </p>
            )}
        </div>
    );
};

export default React.memo(SetupPhase);
