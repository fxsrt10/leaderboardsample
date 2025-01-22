import { useState } from "react";
import axios from "axios";

function ImportButton({ stageId, onImportSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const baseURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001/your-project-id/us-central1'  // Local Firebase emulator
    : 'https://us-central1-acexrsample.cloudfunctions.net';  // Production Firebase


    const importData = async () => {
        setIsLoading(true);
        try {
            console.log('Attempting to fetch leaderboard for stageId:', stageId);
            const response = await axios.get(`${baseURL}/fetchLeaderboard?stageId=${stageId}`);
            console.log('Response:', response.data);
            
            alert("Leaderboard data imported successfully");
            onImportSuccess(); // Call this to show the leaderboard table
        } catch (error) {
            console.error('Error details:', error);
            console.error('Response:', error.response?.data);
            alert("Error trying to import data: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={importData} 
            disabled={isLoading}
        >
            {isLoading ? 'Importing...' : 'Import Leaderboard Data'}
        </button>
    );
}

export default ImportButton;