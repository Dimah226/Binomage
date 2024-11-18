import Svg from './svg';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import '../style/PlayerName.css';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function PlayerName({ handleGroupSaved }) {
    const [playerNumber, setPlayerNumber] = useState(4);
    const [groupNumber, setGroupNumber] = useState('');
    const [classe, setClasse] = useState('Eco')
    const [playerName, setPlayerName] = useState(new Array(4).fill('')); 

    const navigate = useNavigate();

    useEffect(() => {
        const savedGroupNumber = sessionStorage.getItem('groupNumber');
        if (savedGroupNumber) {
            setGroupNumber(savedGroupNumber);
        }
    }, []);

    const addPlayer = () => {
        if (playerNumber < 6) {
            setPlayerNumber(prev => prev + 1);
            setPlayerName(prev => [...prev, '']);
        }
    };

    const removePlayer = () => {
        if (playerNumber > 4) {
            setPlayerNumber(prev => prev - 1);
            setPlayerName(prev => prev.slice(0, -1));
        }
    };

    const handleChangePlayerName = (e, index) => {
        const newPlayerNames = [...playerName];
        newPlayerNames[index] = e.target.value;
        setPlayerName(newPlayerNames);
    };

    const handleChangeGroupNumber = (e) => {
        const value = e.target.value;
        if (!isNaN(value)) {
            setGroupNumber(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            sessionStorage.setItem('groupNumber', groupNumber);
            sessionStorage.setItem("playerNumber", playerNumber);
        } catch (error) {
            console.error('Erreur lors de l’enregistrement dans le sessionStorage :', error);
        }

        const playerGroupRef = collection(db, 'playerGroups');
        const q = query(playerGroupRef, where('groupNumber', '==', groupNumber));

        try {
            const existingGroupSnapshot = await getDocs(q);
            if (!existingGroupSnapshot.empty) {
                const deletePromises = existingGroupSnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
            }

            await addDoc(playerGroupRef, {
                groupNumber: groupNumber,
                classe,
                players: playerName.filter((name) => name.trim() !== ''),
            });

            handleGroupSaved();
            navigate('/player/choose');
        } catch (error) {
            console.error('Erreur lors de l’enregistrement du groupe :', error);
        }
    };

    const handleClasseChange = (e) => {
        setClasse(e.target.value);
    };



    return (
        <section className="player-name">
            <Svg />
            <form onSubmit={handleSubmit}>
                <div className="name-field">
                    <h1>Joueurs, enregistrez-vous</h1>
                    {Array.from({ length: playerNumber }, (_, index) => (
                        <TextField
                            key={index}
                            id={`outlined-basic-${index}`}
                            label={`Joueur ${index + 1}`}
                            variant="outlined"
                            value={playerName[index]}
                            required
                            onChange={(e) => handleChangePlayerName(e, index)}
                        />
                    ))}
                </div>

                <div className="groupe-number">
                    <TextField
                        label="Numéro de groupe"
                        variant="outlined"
                        required
                        value={groupNumber}
                        onChange={handleChangeGroupNumber}
                    />
                    <div className="groupe-radio">
                        <div className="group-content">
                            
                            <input type="radio" name="group1" id="Eco" value="Eco" defaultChecked onChange={handleClasseChange}/>
                            <label htmlFor="Eco">Eco</label>
                        </div>
                        <div className="group-content">
                            
                            <input type="radio" name="group1" id='Math' value="Math" onChange={handleClasseChange} />
                            <label htmlFor="Math">Math</label>
                        </div>
                        
                    </div>
                </div>

                <div className="buttons">
                    <i
                        className="bx bxs-add-to-queue name-icon"
                        onClick={addPlayer}
                        style={{ cursor: 'pointer' }}
                    ></i>

                    <button type="submit" className="submit-button">
                        Commencer
                    </button>

                    <i
                        className="bx bxs-layer-minus name-icon"
                        onClick={removePlayer}
                        style={{ cursor: 'pointer' }}
                    ></i>
                </div>
            </form>
        </section>
    );
}

export default PlayerName;
