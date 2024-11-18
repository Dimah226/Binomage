import Preloader from "./component/Preloader";
import Role from "./component/Role";
import Choose from "./component/Choose";
import PlayerName from "./component/PlayerName";
import Game from "./component/Game";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./component/Auth";
import Admin from "./component/Admin.js";
import { useState, useEffect } from "react";

function App() {
  const [connectez, setConnectez] = useState(sessionStorage.getItem("connectez") === "true");
  const [groupedSave, setGroupedSave] = useState(sessionStorage.getItem("groupNumber") !== null);
  const [idParrainSaved, setIdParrainSaved] = useState(sessionStorage.getItem("idParrainSaved") !== null);

  // Initialisation des valeurs de sessionStorage
  useEffect(() => {
    const storedConnectionState = sessionStorage.getItem("connectez") === "true";  // Vérifie si l'utilisateur est connecté
    const storedGroupNumber = sessionStorage.getItem("groupNumber") !== null;  // Vérifie si le groupe est défini
    const storedParrainIds = sessionStorage.getItem("idParrainSaved") !== null;  // Vérifie si le parrain existe


    setConnectez(storedConnectionState);
    setGroupedSave(storedGroupNumber);
    setIdParrainSaved(storedParrainIds);
  }, []);

  const handleConnect = () => {
    setConnectez(true);
    sessionStorage.setItem("connectez", "true");
  };

  const handleStored = () => {
    setIdParrainSaved(true);
    sessionStorage.setItem("idParrainSaved", "true");
  };

  const handleGroupSaved = () => {
    setGroupedSave(true);
  }
  console.log(groupedSave)
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Preloader />
              <Role />
            </>
          }
        />
        <Route path="/auth" element={<Auth handleConnect={handleConnect} />} />
        <Route
          path="/admin"
          element={connectez ? <Admin /> : <Navigate to="/auth" />}
        />
        <Route path="/player/name" element={<PlayerName  handleGroupSaved={handleGroupSaved}/>} />
        <Route
          path="/player/choose"
          element={groupedSave ? <Choose handleStored={handleStored} /> : <Navigate to="/player/name" />}
        />
        <Route
          path="/player/binomage"
          element={idParrainSaved ? <Game /> : <Navigate to="/player/choose" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
