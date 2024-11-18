import Svg from "./svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../style/Role.css';

function Role() {
    const [role, setRole] = useState("player");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role === "player") {
            navigate("/player/name");
        } else if (role === "Administrateur") {
            navigate("/auth");
        }
    };

    return (
        <div className="choix-container">
            <Svg />
            <main>
                <h1>Qui etes Vous?</h1>
                <form>
                    <label>
                        <input
                            type="radio"
                            name="role"
                            value="player"
                            checked={role === "player"}
                            onChange={handleChange}
                        />
                        <span className="truncate">Joueur</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="role"
                            value="Administrateur"
                            checked={role === "Administrateur"}
                            onChange={handleChange}
                        />
                        <span className="truncate">Administrateur</span>
                    </label>
                    <div className="selection"></div>
                    
                </form>
                <button type="submit" onClick={handleSubmit}>Valider</button>
            </main>
        </div>
    );
}

export default Role;
