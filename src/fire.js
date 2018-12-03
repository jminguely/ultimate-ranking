import firebase from 'firebase'

var config = {
  apiKey: "AIzaSyAmJq1-p-IHEgTY2ws6QedPmxjIeZsldNU",
  authDomain: "ultimate-ranking.firebaseapp.com",
  databaseURL: "https://ultimate-ranking.firebaseio.com",
  projectId: "ultimate-ranking",
  storageBucket: "ultimate-ranking.appspot.com",
  messagingSenderId: "556537029932"
};

var fire = firebase.initializeApp(config);
export default fire;