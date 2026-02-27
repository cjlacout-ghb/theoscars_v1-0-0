import React from "react";
import { CATEGORIES } from "../../lib/constants";

const VotingTab = ({
    mySlot,
    votes,
    winners,
    players,
    otherSlot,
    castVote,
    votedCount,
}) => {
    return (
        <>
            {mySlot && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(votedCount / CATEGORIES.length) * 100}%` }}
                    />
                </div>
            )}
            <p
                style={{
                    fontSize: 16,
                    color: "#6a5a3a",
                    letterSpacing: "0.08em",
                    marginBottom: 30,
                    textAlign: "center",
                }}
            >
                {mySlot
                    ? `${votedCount} de ${CATEGORIES.length} categorías elegidas · Tocá un nominado para votar`
                    : "Regístrate primero para votar"}
            </p>
            {CATEGORIES.map((cat) => (
                <div key={cat.id} className="category-block">
                    <div className="category-name">{cat.name}</div>
                    {cat.nominees.map((nom) => {
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
    );
};

export default React.memo(VotingTab);
