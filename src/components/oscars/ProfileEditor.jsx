import React from "react";
import { EMOJIS } from "../../lib/constants";

const ProfileEditor = ({
    editingEmoji,
    setEditingEmoji,
    editingName,
    setEditingName,
    updateProfile,
    setIsEditingProfile,
}) => {
    return (
        <div className="profile-editor">
            <div className="card-title">Editar Perfil</div>
            <div className="emoji-grid">
                {EMOJIS.map((e) => (
                    <button
                        key={e}
                        className={`emoji-btn ${editingEmoji === e ? "selected" : ""}`}
                        onClick={() => setEditingEmoji(e)}
                    >
                        {e}
                    </button>
                ))}
            </div>
            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Tu nombre o apodo"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength={20}
                />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
                <button className="btn solid" style={{ flex: 2 }} onClick={updateProfile}>
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
