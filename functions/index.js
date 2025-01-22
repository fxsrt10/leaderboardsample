const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();

exports.fetchLeaderboard = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const stageId = req.query.stageId;
      if (!stageId || typeof stageId !== 'string' || stageId.trim() === '') {
        return res.status(400).send("Invalid or missing stageId.");
      }

      const leaderboardUrl = `https://platform.acexr.com/api/1.1/obj/leaderboard/${stageId}`;
      const leaderboardResponse = await axios.get(leaderboardUrl).catch(err => {
        console.error("Error fetching leaderboard data:", err.message);
        throw new Error("Failed to fetch leaderboard data.");
      });
      const results = leaderboardResponse.data.response;
      if (!results.scores_list_custom_score || !results.stagename_text) {
        throw new Error("Leaderboard data is missing required fields.");
      }

      const scoresIds = results.scores_list_custom_score;
      const scoresUrl = `https://platform.acexr.com/api/1.1/obj/score?constraints=[{"key":"_id","constraint_type":"in","value":${JSON.stringify(scoresIds)}}]`;
      const scoresResponse = await axios.get(scoresUrl).catch(err => {
        console.error("Error fetching scores:", err.message);
        throw new Error("Failed to fetch scores data.");
      });

      const scores = scoresResponse.data.response.results;
      const stageRef = db.collection("leaderboards").doc(stageId);

      // Save stage metadata
      await stageRef.set({
        stageName: results.stagename_text,
        threshold_number: results.threshold_number,
      });

      // Save scores as subcollection with batch handling
      const BATCH_SIZE = 500;
      for (let i = 0; i < scores.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchScores = scores.slice(i, i + BATCH_SIZE);

        batchScores.forEach((score) => {
          const scoreRef = stageRef.collection("scores").doc(score._id);
          batch.set(scoreRef, {
            displayName: score.displayname_text,
            hitFactor: score.hitfactor_number,
            rank: score.acerank_option_rank,
            timeInSeconds: score.timeinseconds_number,
          });
        });

        await batch.commit();
      }

      console.log(`Fetched and saved leaderboard for stageId: ${stageId}`);
      res.status(200).json({
        success: true,
        message: "Leaderboard data fetched and saved.",
        stageId,
        totalScores: scores.length,
      });
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching leaderboard data: " + error.message
      });
    }
  });
});

exports.getLeaderboard = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const stageId = req.query.stageId;

      if (!stageId) {
        return res.status(400).json({
          success: false,
          message: "Missing Stage ID"
        });
      }

      const leaderboardSnap = await db.collection("leaderboards").doc(stageId).get();
      if (!leaderboardSnap.exists) {
        return res.status(404).json({
          success: false,
          message: "Stage ID not found"
        });
      }

      const scoresSnap = await db
        .collection("leaderboards")
        .doc(stageId)
        .collection("scores")
        .orderBy("hitFactor", "desc")
        .get();

      const data = {
        success: true,
        stageId: leaderboardSnap.id,
        stageName: leaderboardSnap.get("stageName"),
        threshold: leaderboardSnap.get("threshold_number"),
        scores: scoresSnap.docs.map((doc) => doc.data()),
      };

      res.json(data);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred: " + error.message
      });
    }
  });
});
