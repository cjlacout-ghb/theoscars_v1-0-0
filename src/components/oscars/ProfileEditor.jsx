import React from "react";
import { EMOJIS } from "../../lib/constants";

const ProfileEditor = ({
    editingEmoji,
    setEditingEmoji,
    editingName,
    setEditingName,
    updateProfile,
    setIsEditingProfile,
    players,
    mySlot,
}) => {
    const otherSlot = mySlot === "p1" ? "p2" : "p1";
    const otherPlayer = players[otherSlot];
    const isNameTaken = otherPlayer && editingName.trim().toLowerCase() === otherPlayer.name.toLowerCase();

    return (
        <div className="profile-editor">
            <div className="card-title">Editar Perfil</div>
            <div className="emoji-grid">
                {EMOJIS.map((e) => {
                    const isTaken = otherPlayer && otherPlayer.emoji === e;
                    return (
                        <button
                            key={e}
                            className={`emoji-btn ${editingEmoji === e ? "selected" : ""}`}
                            onClick={() => !isTaken && setEditingEmoji(e)}
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
            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Tu nombre o apodo"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength={20}
                    style={{
                        borderColor: isNameTaken ? "#e07070" : undefined
                    }}
                />
                {isNameTaken && (
                    <p style={{ color: "#e07070", fontSize: 13, marginTop: 8, textAlign: "left", fontStyle: "italic" }}>
                        Este nombre ya está siendo usado
                    </p>
                )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
                <button
                    className="btn solid"
                    style={{ flex: 2 }}
                    onClick={updateProfile}
                    disabled={isNameTaken || !editingEmoji || !editingName.trim()}
                >
                    Guardar Cambios
                </button>
                <button className="btn" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default React.memo(ProfileEditor);
