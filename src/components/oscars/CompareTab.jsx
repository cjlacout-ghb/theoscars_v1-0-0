import React from "react";
import { CATEGORIES, GOLD } from "../../lib/constants";

const CompareTab = ({ votes, p1, p2 }) => {
    return (
        <>
            <p
                style={{
                    fontSize: 16,
                    color: "#6a5a3a",
                    letterSpacing: "0.08em",
                    marginBottom: 28,
                    textAlign: "center",
                }}
            >
                Picks de ambos participantes
            </p>
            {CATEGORIES.map((cat) => {
                const v1 = votes[cat.id]?.p1;
                const v2 = votes[cat.id]?.p2;
                const agree = v1 && v2 && v1 === v2;
                return (
                    <div key={cat.id} className={`compare-row ${agree ? "agree" : ""}`}>
                        <div
                            style={{
                                fontSize: 13,
                                letterSpacing: "0.15em",
                                color: "#6a5a3a",
                                textTransform: "uppercase",
                                marginBottom: 12,
                            }}
                        >
                            {cat.name} {agree && <span style={{ color: GOLD }}>· ✦ Coinciden</span>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 14, color: "#4a3a2a", marginBottom: 6 }}>
                                    {p1?.emoji || "?"} {p1?.name || "J1"}
                                </div>
                                <div style={{ fontSize: 17, color: v1 ? "#c8b88a" : "#3a2a1a", lineHeight: 1.35 }}>
                                    {v1 || "—"}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 14, color: "#4a3a2a", marginBottom: 6 }}>
                                    {p2?.emoji || "?"} {p2?.name || "J2"}
                                </div>
                                <div style={{ fontSize: 17, color: v2 ? "#c8b88a" : "#3a2a1a", lineHeight: 1.35 }}>
                                    {v2 || "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default React.memo(CompareTab);
