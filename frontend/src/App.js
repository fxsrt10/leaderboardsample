import { useState } from "react";
import ImportButton from "./components/ImportButton";
import LeaderboardTable from "./components/LeaderboardTable";

function App() {
  const [stageId, setStageId] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleInputChange = (e) => {
    setStageId(e.target.value);
    setShowLeaderboard(false); // Reset when stageId changes
  };

  const handleImportSuccess = () => {
    setShowLeaderboard(true);
  };

  return (
    <div>
      <h1>Step 1: Enter Stage ID</h1>
      <div>
        <label htmlFor="stageIdInput">Enter Stage ID: </label>
        <input
          id="stageIdInput"
          type="text"
          value={stageId}
          onChange={handleInputChange}
          placeholder="8675309"
        />
      </div>
      
      {stageId && (
        <ImportButton 
          stageId={stageId} 
          onImportSuccess={handleImportSuccess} 
        />
      )}

      {showLeaderboard && (
        <>
          <h1>Step 2: Display Leaderboard</h1>
          <LeaderboardTable stageId={stageId} />
        </>
      )}
    </div>
  );
}

export default App;
