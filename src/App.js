import React, { Component } from 'react';
import fire from './fire';
import './App.scss';
import BarChart from './components/BarChart';
import PlayersSection from './components/PlayersSection';
import NewMatchSection from './components/NewMatchSection';
import icons from './data/icons.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      colors: {},
      players: {}, 
      matchs: [], 
      leaderBoard: {},
      datetime: this.getDate() 
    }; // <- set up react state

    setInterval(() => {
      this.setState({
        datetime: this.getDate() 
      });
    }, 60000);
  }

  getDate() {
    return `${new Date().getFullYear()}-${`${new Date().getMonth() +
        1}`.padStart(2, 0)}-${`${new Date().getDay() + 1}`.padStart(
        2,
        0
      )}T${`${new Date().getHours()}`.padStart(
        2,
        0
      )}:${`${new Date().getMinutes()}`.padStart(2, 0)}`;
  }


  componentWillMount(){
    /* Create reference to players in Firebase Database */
    let playersRef = fire.database().ref('players').orderByKey().limitToLast(100);
    playersRef.on('child_added', snapshot => {
      /* Update React state when player is added at Firebase Database */
      let players = Object.assign({}, this.state.players); 
      let colors = Object.assign({}, this.state.colors); 
      let leaderBoard = Object.assign({}, this.state.leaderBoard); 

      colors[snapshot.key] = snapshot.val().playerColor;

      players[snapshot.key] = snapshot.val();

      leaderBoard[snapshot.key] = [];
      

      this.setState({ 
        leaderBoard: leaderBoard,
        colors: colors,
        players: players,
      });
    })

    playersRef.on('child_changed', snapshot => {
      let players = Object.assign({}, this.state.players); 
      // console.log(players, snapshot.key, snapshot.val());
      players[snapshot.key] = snapshot.val();
      this.setState({ players: players,});
    })
    

    let matchsRef = fire.database().ref('matchs').orderByChild("Date").limitToLast(100);
    matchsRef.on('child_added', snapshot => {
      let leaderBoard = Object.assign({}, this.state.leaderBoard); 

      leaderBoard[snapshot.key] = snapshot.val().playerColor;

      let match = { 
        matchDate: snapshot.val().matchDate, 
        id: snapshot.key,
        matchResults: snapshot.val().matchResults
      };

      Object.keys(this.state.leaderBoard).map((playerKey) =>{
        let result = null;
        for (let rank of match.matchResults){
          if (rank.playerKey === playerKey) {
            result = rank.newScore;
          }
        }
        if(result !== null) {
          this.state.leaderBoard[playerKey].push(result);
        }else {
          const lastIndex = this.state.leaderBoard[playerKey].length;
          const lastScore = this.state.leaderBoard[playerKey][lastIndex-1] || 1000;
          this.state.leaderBoard[playerKey].push(lastScore);
        }
      });


      this.setState({ 
        matchs: [match].concat(this.state.matchs),
        // leaderBoard: leaderBoard,
        });
    })

  }
  

  handleChange = (field, e) => {
    this.setState({ [field]: e.target.value });
  };


  render() {
    return (
      <div className="App">
        <section className="Section">
          <PlayersSection players={this.state.players}/>
        </section>
        <section className="Section">
          <NewMatchSection matchs={this.state.matchs} players={this.state.players}/>
        </section>
        <section className="Schema">
          <BarChart leaderBoard={this.state.leaderBoard} players={this.state.players} matchs={this.state.matchs}/>
        </section>
      </div>
    );
  }
}

export default App;