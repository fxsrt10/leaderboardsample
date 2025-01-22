import { useState, useEffect } from "react";
import axios from "axios";
import './LeaderboardTable.css';

function LeaderboardTable({stageId}) {
    const [scores, setScores] = useState([]);
    const [searchParams, setSearchParams] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [scoresPerPage] = useState(20); // Number of scores per page

    useEffect(() => {
        const fetchScores = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Use the full URL in development, relative path in production
                const baseUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:5001/acexrsample/us-central1'  // Local Firebase emulator
                : 'https://us-central1-acexrsample.cloudfunctions.net';  // Production Firebase
            
                
                console.log('Fetching scores for stageId:', stageId);
                const response = await axios.get(`${baseUrl}/getLeaderboard?stageId=${stageId}`);
                console.log('Response:', response.data);
                
                if (response.data && response.data.scores) {
                    setScores(response.data.scores);
                    setCurrentPage(1);
                } else {
                    console.error('No scores in response:', response.data);
                    setError('No scores found in the response');
                }
            } catch(error) {
                console.error('Error fetching scores:', error);
                console.error('Error details:', error.response?.data || error.message);
                setError('Failed to load leaderboard. Please try again.');
                setScores([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (stageId) {
            fetchScores();
        }
    }, [stageId]);

    // Will filter scores based on search params
    const filteredScores = scores && Array.isArray(scores) 
        ? scores.filter((score) => {
            if (!searchParams) return true;
            return score?.displayName?.toLowerCase().includes(searchParams.toLowerCase());
          })
        : [];

    // Gets current scores on the page
    const indexOfLastScore = currentPage * scoresPerPage;
    const indexOfFirstScore = indexOfLastScore - scoresPerPage;
    const currentScores = filteredScores.slice(indexOfFirstScore, indexOfLastScore);
    const totalPages = Math.ceil(filteredScores.length / scoresPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    console.log('Filtered Scores:', filteredScores);

    if (isLoading) {
        return <div className="loading">Loading leaderboard...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="leaderboard-container">
            {scores.length > 0 && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by player name..."
                        value={searchParams}
                        onChange={(e) => {
                            setSearchParams(e.target.value);
                            setCurrentPage(1); // Resets to first page when seearching
                        }}
                        className="search-input"
                    />
                </div>
            )}
            
            {filteredScores.length === 0 ? (
                <div className="no-scores">
                    {searchParams 
                        ? "No players found matching your search" 
                        : "No scores available for this stage"}
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player Name</th>
                                    <th>Hit Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentScores.map((score, index) => (
                                    <tr key={index} 
                                        className={
                                            (indexOfFirstScore + index) < 3 
                                                ? `top-${indexOfFirstScore + index + 1}` 
                                                : ''
                                        }>
                                        <td>{indexOfFirstScore + index + 1}</td>
                                        <td>{score?.displayName || 'N/A'}</td>
                                        <td>{typeof score?.hitFactor === 'number' 
                                            ? score.hitFactor.toFixed(2) 
                                            : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="page-button"
                            >
                                Previous
                            </button>
                            
                            <div className="page-numbers">
                                {pageNumbers.map(number => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`page-button ${currentPage === number ? 'active' : ''}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="page-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default LeaderboardTable;