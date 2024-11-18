import { useEffect, useState } from "react";
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import logo from '../images/logo.png';
import '../style/Game.css';
import Svg from "./svg";

const Game = () => {
  const [cards, setCards] = useState([]);
  const [Parrains, setParrains] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [players, setPlayers] = useState([]);
  const [infoModal, setInfoModal] = useState({ isVisible: false, filleule: "", parrain: null });
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialFlip, setInitialFlip] = useState(true);
  const groupNumber = sessionStorage.getItem('groupNumber');

  const initializeGame = (parrains, etrangers) => {
    const totalPairs = parrains.length;

    const parrainPairs = parrains.map((parrain) => ({
      id: parrain.Id,
      value: parrain.codeI,
    }));

    let etrangersAdd = etrangers.map((etranger) => ({
      id: etranger.Id,
      value: etranger.codeI,
    }));

    etrangersAdd = etrangersAdd.sort(() => Math.random() - 0.5);
    etrangersAdd = etrangersAdd.slice(0, 16 - totalPairs * 2);

    const allCards = [
      ...parrainPairs,
      ...parrainPairs,
      ...etrangersAdd,
    ]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, position: index }));

    setCards(allCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);

    setInitialFlip(true);
    setTimeout(() => {
      setInitialFlip(false);
    }, 1000);
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const playerGroupRef = collection(db, 'playerGroups');
      const q = query(playerGroupRef, where('groupNumber', '==', groupNumber));
      const querySnapshot = await getDocs(q);

      const parrainIdsString = sessionStorage.getItem('parrainIds');
      const parrainList = parrainIdsString ? JSON.parse(parrainIdsString) : [];

      if (parrainList.length > 0) {
        const parrainRef = collection(db, 'Parrain');
        const parrainsSnapshot = await getDocs(parrainRef);

        const parrains = [];
        const etrangers = [];
        parrainsSnapshot.forEach((doc) => {
          if (parrainList.includes(doc.id)) {
            parrains.push({ Id: doc.id, ...doc.data() });
          } else {
            etrangers.push({ Id: doc.id, ...doc.data() });
          }
        });

        setParrains(parrains);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setPlayers(data.players);
        });
        initializeGame(parrains, etrangers);
      } else {
        console.error('Aucun parrain trouvé, parrainIds est vide.');
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [groupNumber]);

  const checkMatch = (secondId) => {
    const [firstId] = flipped;

    if (cards[firstId].value === cards[secondId].value) {
      setSolved([...solved, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);

      const parrain = Parrains.filter((p) => p.codeI === cards[firstId].value);

      handleInfo(players[currentPlayerIndex], parrain);

      if (parrain.length > 0) {
        const parrainId = parrain[0].Id;
        updateResultatsFirestore(db, parrainId, players[currentPlayerIndex]);
      }

      setPlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers];
        updatedPlayers.splice(currentPlayerIndex, 1);
        return updatedPlayers;
      });

      setCurrentPlayerIndex((prevIndex) => {
        if (players.length === 1) return 0;
        return prevIndex % (players.length - 1);
      });
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
        changePlayer();
      }, 1000);
    }
  };

  const handleClick = (id) => {
    if (disabled || won || solved.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);
      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);
        checkMatch(id);
      } else {
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  const handleInfo = async (filleule, parrain) => {
    const imagePath = await handleImageError(parrain);
    setInfoModal({
      isVisible: true,
      filleule,
      parrain,
      path: imagePath
    });
  };

  const closeInfoModal = () => {
    setInfoModal({
      isVisible: false,
      filleule: "",
      parrain: null,
      path: null
    });
  };

  const updateResultatsFirestore = async (db, parrainId, filleule) => {
    try {
      const resultatsRef = collection(db, "Resultat");
      const querySnapshot = await getDocs(resultatsRef);

      const existingDoc = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.IdParrain === parrainId);

      if (existingDoc.length > 0) {
        const docRef = doc(resultatsRef, existingDoc[0].id);
        await updateDoc(docRef, { nFilleule: filleule });
      } else {
        const newDoc = { IdParrain: parrainId, nFilleule: filleule };
        await setDoc(doc(resultatsRef), newDoc);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de Firestore:", error);
    }
  };

  const changePlayer = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  useEffect(() => {
    const totalPairs = Parrains.length;
    if (solved.length === totalPairs * 2) {
      setWon(true);
    }
  }, [solved, players]);

  const handleImageError = async (parrain) => {
    const formats = ['jpeg', 'jpg', 'png'];
    const baseImageUrl = `/images/${parrain?.[0]?.Id}`;
    const defaultImage = '/images/image.jpg';

    for (let format of formats) {
      const imageUrl = `${baseImageUrl}.${format}`;
      try {
        const response = await fetch(imageUrl);
        const contentType = response.headers.get('Content-Type');
        if (response.ok && contentType && contentType.startsWith('image/')) {
          return imageUrl;
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de l'image : ${imageUrl}`, error);
      }
    }
    return defaultImage;
  };

  const isFlipped = (id) => {
    return flipped.includes(id) || solved.includes(id) || initialFlip;
  };

  const isSolved = (id) => solved.includes(id);


  return (
    <div className="game-container">
      {loading ? (
        <div className="loading">
          <Svg />
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="logo" className="logo-down" />
          <Svg />
          <div className="player-info">
            <h2>Joueur: <span>{players[currentPlayerIndex]}</span></h2>
          </div>

          {infoModal.isVisible && (
            <div className="modal">
              <img
                className="Parrain-img"
                src={infoModal.path}
                alt="image-parrain"
              />
              <div className="modal-content">
                <h3>Paire trouvée ! <i className={`bx ${infoModal.parrain[0].codeI}`}></i></h3>
                <p className="filleule">
                  <strong>Filleul(e) :</strong> {infoModal.filleule}
                  <i></i>
                </p>
                <div className="parrain-info">
                  <p><strong>{infoModal.parrain[0]?.sexe === "H" ? 'Parrain :' : 'Maraine :'}</strong> {infoModal.parrain[0]?.Nom_Prenoms || "Inconnu"}</p>
                  <p><strong>Contact :</strong> {infoModal.parrain[0]?.Contact || "Inconnu"}</p>
                  <p><strong>Chambre :</strong> {infoModal.parrain[0]?.Chambre || "Inconnu"}</p>
                </div>
                <i onClick={closeInfoModal} className="icon-close bx bx-log-out-circle"></i>
              </div>
            </div>
          )}

          <div className="grid-container">
            {cards.map((card) => (
              <div
                key={card.position}
                onClick={() => !flipped.includes(card.position) && handleClick(card.position)}
                className={`card ${isFlipped(card.position) ? (isSolved(card.position) ? "flipped-solved" : "flipped") : ""}`}
              >
                {isFlipped(card.position) ? (
                  <i className={`bx ${card.value}`}></i>
                ) : (
                  <img className="logo" src={logo} alt="logo" />
                )}
              </div>
            ))}
          </div>

          <div className={`win-message ${won ? 'visible' : 'hide'}`}>Merci, allez rejoindre vos parrains!</div>
        </>
      )}
    </div>
  );
};

export default Game;