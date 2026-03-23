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
    isVotingClosed,
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
                {isVotingClosed
                    ? `Votación finalizada (${votedCount} de ${CATEGORIES.length} categorías completadas)`
                    : mySlot
                        ? `${votedCount} de ${CATEGORIES.length} categorías elegidas · Tocá un nominado para votar`
                        : "Regístrate primero para votar"}
            </p>
            {CATEGORIES.map((cat) => (
                <div key={cat.id} className="category-block">
                    <h2 className="category-name" style={{ margin: 0, marginBottom: 16 }}>{cat.name}</h2>
                    {cat.nominees.map((nom) => {
                        const myVote = mySlot && votes[cat.id]?.[mySlot] === nom;
                        const otherVote = votes[cat.id]?.[otherSlot] === nom;
                        const isWinner = (winners[cat.id] ?? []).includes(nom);
                        return (
                            <div
                                key={nom}
                                role="button"
                                tabIndex={mySlot && !isVotingClosed ? 0 : -1}
                                aria-pressed={myVote}
                                aria-label={`Votar por ${nom} en la categoría ${cat.name}`}
                                className={`nominee-row ${isWinner ? "winner-highlight" : ""} ${isVotingClosed ? "disabled" : ""}`}
                                onClick={() => mySlot && !isVotingClosed && castVote(cat.id, nom)}
                                onKeyDown={(e) => {
                                    if (mySlot && !isVotingClosed && (e.key === "Enter" || e.key === " ")) {
                                        e.preventDefault();
                                        castVote(cat.id, nom);
                                    }
                                }}
                            >
                                <span className="nominee-name">{nom}</span>
                                <span className="vote-indicators">
                                    {isWinner && <span aria-hidden="true">🏆</span>}
                                    {myVote && mySlot && <span title="Tu voto">{players[mySlot]?.emoji}</span>}
                                    {otherVote && players[otherSlot] && <span title={`Voto de ${players[otherSlot].name}`}>{players[otherSlot].emoji}</span>}
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
