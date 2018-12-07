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
  const match = JSON.parse(req.body)

  const playersRef = admin.database().ref('/players');

  const players = [];
  
  playersRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      players[childKey] = childData;
    });
  }).then(() => {
    match.currentScores = [];

    let playerAlreadyRanked = [];
    let ratio = 0.1;

    match.matchResults.forEach((playerA, indexPlayerA) => {
      if(Object.keys(match.matchResults[indexPlayerA]).length === 0) {
        match.matchResults.splice(indexPlayerA, 1);
      } else {
        match.matchResults[indexPlayerA]['prevScore'] = players[playerA.playerKey].playerScore;
        match.matchResults.forEach((playerB, indexPlayerB) => {
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

    //Save the new scores
    match.matchResults.forEach((player, index) => {
      match.matchResults[index]['newScore'] = players[player.playerKey].playerScore;

      var updates = {};
      updates[`/players/${player.playerKey}/playerScore`] = players[player.playerKey].playerScore
      admin.database().ref().update(updates)
    });

    return admin.database().ref('/matchs').push(match).then((snapshot) => {});
  });

  }, (error) => {
   res.status(error.code).json({
    message: `Something went wrong. ${error.message}`
   })
  })
})
