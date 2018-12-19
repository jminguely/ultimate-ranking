const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
    origin: true,
});

admin.initializeApp();


exports.addMatch = functions.https.onRequest((req, res) => {
 return cors(req, res, () => {
  if(req.method !== 'POST') {
   return res.status(401).json({
    message: 'Not allowed'
   })
  }
  const data = JSON.parse(req.body)
  console.log(data);

  const playersRef = admin.database().ref(`/leagues/${data.leagueId}/leaguePlayers`);
  const players = [];
  
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      players[childKey] = childData;
    });
  }).then(() => {
    data.currentScores = [];

    let playerAlreadyRanked = [];
    let ratio = 0.1;

    data.match.matchResults.forEach((playerA, indexPlayerA) => {
      if(Object.keys(data.match.matchResults[indexPlayerA]).length === 0) {
        data.match.matchResults.splice(indexPlayerA, 1);
      } else {
        data.match.matchResults[indexPlayerA]['prevScore'] = players[playerA.playerKey].playerScore;
        data.match.matchResults.forEach((playerB, indexPlayerB) => {
          if (playerA.playerKey !== playerB.playerKey && playerAlreadyRanked.includes(playerB.playerKey)) {

            const misePlayerA = ratio * players[playerA.playerKey].playerScore;
            const misePlayerB = ratio * players[playerB.playerKey].playerScore;

            if (indexPlayerA < indexPlayerB) {
              players[playerA.playerKey].playerScore = players[playerA.playerKey].playerScore + misePlayerB;
              players[playerB.playerKey].playerScore = players[playerB.playerKey].playerScore - misePlayerB;
            } else {
              players[playerA.playerKey].playerScore = players[playerA.playerKey].playerScore - misePlayerA;
              players[playerB.playerKey].playerScore = players[playerB.playerKey].playerScore + misePlayerA;
            }
          }
        });
        playerAlreadyRanked.push(playerA.playerKey);
      }
    });


    // Save the new scores
    data.match.matchResults.forEach((player, index) => {
      data.match.matchResults[index]['newScore'] = players[player.playerKey].playerScore;

      var updates = {};
      updates[`/leagues/${data.leagueId}/leaguePlayers/${player.playerKey}/playerScore`] = players[player.playerKey].playerScore
      admin.database().ref().update(updates)
    });

    return admin.database().ref(`/leagues/${data.leagueId}/leagueMatchs`).push(data.match).then((snapshot) => {'success'});
  });

  }, (error) => {
   res.status(error.code).json({
    message: `Something went wrong. ${error.message}`
   })
  })
})
