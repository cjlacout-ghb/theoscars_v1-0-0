import React from "react";
import { GOLD } from "../../lib/constants";

const PlayerHeader = ({ p1, p2, mySlot, scores, revealedCount }) => {
    if (!p1 && !p2) return null;

    return (
        <div className="players-bar">
            {[p1, p2].map((pl, i) => {
                const slot = i === 0 ? "p1" : "p2";
                const isMe = mySlot === slot;
                return pl ? (
                    <div key={i} className="player-badge">
                        <span className="player-emoji">{pl.emoji}</span>
                        <div>
                            <div className="player-name">
                                {pl.name} {isMe && <span style={{ fontSize: 12, opacity: 0.6 }}>(Tú)</span>}
                            </div>
                            <div className="player-info">Jugador {i + 1}</div>
                        </div>
                        {revealedCount > 0 && (
                            <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 36,
                                        color: GOLD,
                                        lineHeight: 1,
                                    }}
                                >
                                    {i === 0 ? scores.p1 : scores.p2}
                                </div>
                                <div style={{ fontSize: 13, color: "#6a5a3a", letterSpacing: "0.1em" }}>
                                    aciertos
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div key={i} className="player-badge">
                        <span className="player-emoji" style={{ opacity: 0.2 }}>
                            ?
                        </span>
                        <div>
                            <div className="player-name" style={{ color: "#3a2a1a" }}>
                                Esperando...
                            </div>
                            <div className="player-info">Jugador {i + 1}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(PlayerHeader);
