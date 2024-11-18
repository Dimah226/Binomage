import BinoResult from "./BinoResult";
import Svg from "./svg";
import '../style/Admin.css';
import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import Fab from '@mui/material/Fab';

function Admin() {
    const [binos, setBinos] = useState([]);
    const [parrains, setParrains] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [repartResults, setRepartResults] = useState([]); // État pour stocker les résultats

    useEffect(() => {
        const unsubscribeBinos = onSnapshot(
            collection(db, "Resultat"),
            (binosSnapshot) => {
                const binosList = binosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const unsubscribeParrains = onSnapshot(
                    collection(db, "Parrain"),
                    (parrainsSnapshot) => {
                        const parrainsList = parrainsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        const unsubscribeGroups = onSnapshot(
                            collection(db, "playerGroups"),
                            (groupsSnapshot) => {
                                const groupsList = groupsSnapshot.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));

                                const parrainsMap = parrainsList.reduce((acc, parrain) => {
                                    acc[parrain.Id] = parrain;
                                    return acc;
                                }, {});
                                const combinedData = binosList.map(bino => ({
                                    ...bino,
                                    parrain: parrainsMap[bino.IdParrain] || null
                                }));

                                setBinos(combinedData);
                                setParrains(parrainsList);
                                setGroups(groupsList);
                                setLoading(false);
                            },
                            (err) => setError("Erreur lors de la récupération des groupes")
                        );

                        return () => unsubscribeGroups();
                    },
                    (err) => setError("Erreur lors de la récupération des parrains")
                );

                return () => unsubscribeParrains();
            },
            (err) => setError("Erreur lors de la récupération des binos")
        );

        return () => unsubscribeBinos();
    }, []);

    if (loading) {
        return <div>Chargement...</div>; 
    }

    if (error) {
        return <div>{error}</div>; 
    }

    const handleDel = async () => {
        try {
            const resultatsRef = collection(db, 'Resultat');
            const querySnapshot = await getDocs(resultatsRef);

            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(resultatsRef, document.id));
            });
        } catch (error) {
            console.error("Erreur lors de la suppression des documents :", error);
        }
    };

    const handleDelGroup = async () => {
        try {
            const playerGroupRef = collection(db, 'playerGroups');
            const querySnapshot = await getDocs(playerGroupRef);

            querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(playerGroupRef, document.id));
            });
        } catch (error) {
            console.error("Erreur lors de la suppression des documents :", error);
        }
    };

    const handleRepartition = () => {
        const parrainsEco = parrains.filter((p) => p.classe === "Eco");
        const parrainsMath = parrains.filter((p) => p.classe === "Math");
    
        const FilleulEco = groups.filter((g) => g.classe === "Eco").flatMap((g) => g.players);
        const FilleulMath = groups.filter((g) => g.classe === "Math").flatMap((g) => g.players);
    
        // Mélange aléatoire avec Fisher-Yates
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Échange les éléments
            }
            return array;
        };
    
        const adjustAndShuffle = (parrains, filleulsCount) => {
            let adjustedParrains = shuffle([...parrains]);  // Mélanger aléatoirement
            while (adjustedParrains.length <= filleulsCount) {
                adjustedParrains.push(...shuffle([...parrains]));  // Mélanger à nouveau si nécessaire
            }
            return adjustedParrains;
        };
    
        let parrainsEcoRevisited = adjustAndShuffle(parrainsEco, FilleulEco.length);
        let parrainsMathRevisited = adjustAndShuffle(parrainsMath, FilleulMath.length);
    
        console.log(parrainsEcoRevisited, parrainsMathRevisited);
    
        const Repart = groups.map((g) => {
            const isEco = g.classe === "Eco";
            const parrainsRevisited = isEco ? [...parrainsEcoRevisited] : [...parrainsMathRevisited]; // Créer une copie pour chaque itération
    
            let listParrain = [];
    
            g.players.forEach((p) => {
                let i = 0;
                let aucun = true;
    
                while (i < parrainsRevisited.length && aucun) {
                    // Si le parrain est déjà dans listParrain, on passe à l'index suivant
                    if (listParrain.some(parrain => parrain.id === parrainsRevisited[i].id)) {
                        i++;
                    } else {
                        // Sinon, on l'ajoute à listParrain
                        listParrain.push(parrainsRevisited[i]);
                        parrainsRevisited.splice(i, 1);  // Retirer le parrain de parrainsRevisited
                        aucun = false;
                    }
                }
            });
    
            // Met à jour les parrains revisités après chaque groupe
            if (isEco) {
                parrainsEcoRevisited = parrainsRevisited;
            } else {
                parrainsMathRevisited = parrainsRevisited;
            }
    
            return {
                gNumber: g.groupNumber,
                gClasse: g.classe,
                listParrain,
            };
        });
    
        setRepartResults(Repart); // Met à jour l'état avec les résultats
        document.querySelector('.repart-results').classList.add('visible');
    };
    
    

    const handleRemove= ()=>{
        document.querySelector('.repart-results').classList.remove('visible');
    }

    return (
        <section className="yo">
            <div className="admin-container">
                <Svg />
                <h1 className="text">Que Vous réserve le sort ?</h1>
                <i className='bx bx-reset' onClick={handleDel}></i>
                <i className='bx bx-refresh' onClick={handleDelGroup}></i>
                <i className='bx bxs-share' onClick={handleRepartition}></i>

                {binos.map((bino) => (
                    <BinoResult 
                        key={bino.id} 
                        number={bino.parrain?.Id}
                        nomFilleule={bino.nFilleule} 
                        nomParrain={bino.parrain?.Nom_Prenoms || "Non attribué"}
                        contact={bino.parrain?.Contact || "Non disponible"}
                        chambre={bino.parrain?.Chambre || "Non assignée"}
                        Svg={bino.parrain?.codeI || "Non spécifié"}
                        sexe={bino.parrain?.sexe || "Non précisé"}
                    />
                ))}

                {/* Affichage des résultats de la répartition */}
                <div className="repart-results">
                    <h2>Résultats de la Répartition</h2>
                    <div className="group-result">
                    {repartResults.map((result, index) => (
                        
                            <div className="group-repart" key={index}>

                                <h3>Groupe {result.gNumber} - Classe : {result.gClasse}</h3>
                                
                                    {result.listParrain.map((parrain, idx) => (
                                        <Fab
                                            key={idx}
                                            variant="extended"
                                            value={parrain.Id}

                                        >
                                            {parrain.Id}
                                        </Fab>
                                    ))}

                            </div>
                            
                        
                    ))}
                    </div>
                    <i className='bx bxs-chevron-left-circle' onClick={handleRemove}></i>
                </div>
            </div>
        </section>
    );
}

export default Admin;
