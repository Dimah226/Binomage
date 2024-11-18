import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import '../style/Choose.css';
import Svg from "./svg";

function Choose({ handleStored }) {
    const [parrain, setParrain] = useState([]);
    const [checked, setChecked] = useState(0);
    const [checkedIds, setCheckedIds] = useState([]);
    const [checkedId, setCheckedId] = useState([]);
    const [error, setError] = useState("");
    const playerNumber = parseInt(sessionStorage.getItem("playerNumber"));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const parrainsSnapshot = await getDocs(collection(db, "Parrain"));
                const parrainsList = parrainsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setParrain(parrainsList);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        };

        fetchData();
    }, []);

    const handleClick = (e, index) => {
        const target = e.target;
        const isChecked = target.classList.contains("checked");
    
        
        const selectedParrain = parrain.find(p => p.Id === target.value);
    
        if (!selectedParrain) {
            console.error("Parrain non trouvé pour l'ID :", target.value);
            return;
        }
    
        if (checked === playerNumber && !isChecked) {
            setError("Vous avez choisi suffisamment.");
        } else if (isChecked) {
            target.classList.remove("checked");
            setChecked(prevChecked => prevChecked - 1);
            setCheckedIds(prevCheckedIds => prevCheckedIds.filter(id => id !== selectedParrain.id));
            setCheckedId(prevCheckedId => prevCheckedId.filter(id => id !== selectedParrain.Id));
            setError("");
        } else {
            target.classList.add("checked");
            setChecked(prevChecked => prevChecked + 1);
            setCheckedIds(prevCheckedIds => [...prevCheckedIds, selectedParrain.id]);
            setCheckedId(prevCheckedId => [...prevCheckedId, selectedParrain.Id]);
            setError("");
        }
    
        console.log(selectedParrain,selectedParrain.Id);
        console.log(checkedIds,checkedId)
    };
    

    const navigate = useNavigate();

    const handleStartGame = () => {
        if (checked === playerNumber) {
            sessionStorage.setItem("parrainIds", JSON.stringify(checkedIds));
            handleStored();
            navigate("/player/binomage");
        } else {
            setError("Vous devez choisir suffisamment de parrains.");
        }
    };

    return (
        <section className="choix-container">
            <Svg />
            <h1 className='titre-choix'>Cochez les numéros de vos parrains</h1>
            {error && <p className="choix-error-message">{error}</p>}
            <div className='btn-container'>
                {parrain.map((_, index) => (
                    <Fab
                        key={index + 1}
                        variant="extended"
                        onClick={(e) => handleClick(e, index)}
                        value={index + 1}
                        disabled={
                                checked === playerNumber && !checkedId.includes(String(index+1))
                            }

                    >
                        {index + 1}
                    </Fab>
                ))}
            </div>
            <button className='btn-choix' onClick={handleStartGame}>Commencer</button>
            
        </section>
    );
}

export default Choose;
