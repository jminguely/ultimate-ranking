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
  console.log(req.body)
  const match = JSON.parse(req.body)
  console.log(match);

  return admin.database().ref('/matchs').push(match).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    // console.log(snapshot.ref.toString());
    // return res.redirect(303, snapshot.ref.toString());
  });
  
  }, (error) => {
   res.status(error.code).json({
    message: `Something went wrong. ${error.message}`
   })
  })
})
