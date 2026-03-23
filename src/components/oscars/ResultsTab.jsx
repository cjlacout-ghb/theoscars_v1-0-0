import React from "react";
import { CATEGORIES, GOLD } from "../../lib/constants";

const ResultsTab = ({ scores, p1, p2, winners, votes, revealedCount }) => {
    if (revealedCount === 0) return null;

    return (
        <>
            {revealedCount === CATEGORIES.length && (
                <div className="winner-banner">
                    {scores.p1 > scores.p2 ? (
                        <>
                            <h2>
                                {p1?.emoji} {p1?.name} ganó
                            </h2>
                            <p>
                                {scores.p1} vs {scores.p2} aciertos · ¡Felicitaciones!
                            </p>
                        </>
                    ) : scores.p2 > scores.p1 ? (
                        <>
                            <h2>
                                {p2?.emoji} {p2?.name} ganó
                            </h2>
                            <p>
                                {scores.p2} vs {scores.p1} aciertos · ¡Felicitaciones!
                            </p>
                        </>
                    ) : (
                        <>
                            <h2>🤝 Empate</h2>
                            <p>{scores.p1} aciertos cada uno</p>
                        </>
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
            {CATEGORIES.map((cat) => {
                const winArr = winners[cat.id];          // array o null
                if (!winArr || winArr.length === 0) return null;
                const p1hit = winArr.includes(votes[cat.id]?.p1);
                const p2hit = winArr.includes(votes[cat.id]?.p2);
                const isTie = winArr.length > 1;
                return (
                    <div key={cat.id} className="result-row">
                        <h3
                            style={{
                                fontSize: 13,
                                letterSpacing: "0.15em",
                                color: "#6a5a3a",
                                textTransform: "uppercase",
                                marginBottom: 10,
                                margin: 0
                            }}
                        >
                            {cat.name}
                            {isTie && (
                                <span style={{ color: "#c87878", fontSize: 11, marginLeft: 8, letterSpacing: "0.08em" }}>
                                    🤝 EMPATE HISTÓRICO
                                </span>
                            )}
                        </h3>
                        <div style={{ color: GOLD, fontSize: 18, marginBottom: 10, lineHeight: 1.5 }}>
                            {winArr.map((w, i) => (
                                <div key={w}>🏆 {w}</div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 24 }}>
                            {p1 && (
                                <span style={{ fontSize: 17, color: p1hit ? "#a0c878" : "#6a5a3a" }}>
                                    {p1.emoji} {p1hit ? "✓ acertó" : "✗"}
                                </span>
                            )}
                            {p2 && (
                                <span style={{ fontSize: 17, color: p2hit ? "#a0c878" : "#6a5a3a" }}>
                                    {p2.emoji} {p2hit ? "✓ acertó" : "✗"}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default React.memo(ResultsTab);
