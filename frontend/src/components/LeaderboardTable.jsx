import { useState, useEffect } from "react";
import axios from "axios";

function LeaderboardTable({stageId}) {
    const [scores, setScores] = useState([]);

    const [searchParams, setSearchParams] = useState("");

    const baseURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001/your-project-id/us-central1'  // Local Firebase emulator
    : 'https://us-central1-acexrsample.cloudfunctions.net';  // Production Firebase


    useEffect(() => {
        const fetchScores = async () => {
            try {
                // Use relative path when deployed
                const response = await axios.get(`${baseURL}/getLeaderboard?stageId=${stageId}`);
                setScores(response.data.scores || []);
            } catch(error) {
                console.error('Error fetching scores:', error);
                console.log('Error details:', error.response); // This will help debug
                setScores([]);
            }
        };
        if (stageId) {
            fetchScores();
        }
    }, [stageId]);

    const filteredScores = scores && Array.isArray(scores) 
        ? scores.filter((score) => 
            score?.displayName?.toLowerCase().includes(searchParams.toLowerCase())
          )
        : [];

    return (
      <div>

        <input
          type="text"
          placeholder="Search by player"
          value={searchParams}
          onChange={(e) => setSearchParams(e.target.value)}
          style={{
            marginBottom: "10px",
            padding: "5px",
            fontSize: "16px",
            width: "100%",
          }}
        />
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player Name</th>
              <th>Hit Factor</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.map((score, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{score?.displayName || 'N/A'}</td>
                <td>{score?.hitFactor || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

export default LeaderboardTable;