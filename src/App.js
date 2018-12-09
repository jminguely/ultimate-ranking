import React, { Component } from 'react';
import fire from './fire';
import './App.scss';
import BarChart from './components/BarChart';
import { GithubPicker } from 'react-color';
import axios from 'axios';
import icons from './data/icons.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      colors: {},
      players: {}, 
      matchs: [], 
      newMatch: [{}],
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
  
  addplayer(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the player to Firebase */
    fire.database().ref('players').push( {
      "playerName": this.inputPlayerName.value,
      "playerScore": 1000,
      "playerColor": '#ffffff'
    } );
    this.inputPlayerName.value = ''; // <- clear the input
  }
  addmatch(e){
    e.preventDefault(); // <- prevent form submit from reloading the page

    axios({
      method: 'post',
      url: 'http://localhost:5000/ultimate-ranking/us-central1/addMatch',
      data: {
        matchDate: this.inputDate.value,
        matchResults: this.state.newMatch,
      },
      headers: {
          'Content-Type': 'text/plain;charset=utf-8',
      },
    }).then(function (response) {
        console.log(response);
        this.setState({ newMatch: [{}] });
    }).catch(function (error) {
        console.log(error);
    });
  }

  handleChange = (field, e) => {
    this.setState({ [field]: e.target.value });
  };

  handleChangePlayer = (field, e, key) => {
    let players = Object.assign({}, this.state.players);

    if(field === 'playerColor') {
      players[key].playerColor = e.hex;
    }else {
      players[key][field] = e.target.value;
    }

    this.setState({ players: players });

    var updates = {};

    updates['/players/' + key] = players[key]

    fire.database().ref().update(updates)
  };

  handleChangeNewMatch = (field, e, i) => {
    let newMatch = Object.assign([], this.state.newMatch); 
    newMatch[i][field] = e.target.value;

    if(!newMatch[i]['playerCharacter'] && newMatch[i]['playerKey'] ) {
      newMatch[i]['playerCharacter'] = this.state.players[newMatch[i]['playerKey']].playerMainCharacter
    }

    if (newMatch.length < 8 && newMatch[newMatch.length-1].playerKey){
      newMatch.push({});
    }

    this.setState({ newMatch: newMatch });
  };

  render() {
    return (
      <div className="App">
        <section className="Section">
        <h2>Joueurs</h2>
        <form onSubmit={this.addplayer.bind(this)}>
          <label htmlFor="playerName">Name</label><br />
          <input name="playerName" id="playerName" type="text" ref={ el => this.inputPlayerName = el }/><br />
          <input type="submit"/>
          <hr />
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Color</th>
                <th></th>
                <th>Main Character</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              { /* Render the list of players */
              Object.keys(this.state.players).sort((a, b) => this.state.players[a].playerScore - this.state.players[b].playerScore).reverse().map(key => (
                  <tr key={key}>
                    <td>{this.state.players[key].playerName}</td>
                    <td>
                      <div className="colorPlayer" style={{background: this.state.players[key].playerColor, width: '1em', height: '1em', border: '1px solid black'}}>
                        <GithubPicker 
                          className="colorPicker"
                          color={ this.state.players[key].playerColor }
                          onChange={(e) => this.handleChangePlayer('playerColor', e, key)}/>
                      </div>
                    </td>
                    <td>
                      {
                        this.state.players[key].playerMainCharacter && (
                          <img alt="" className="characterIcon" src={`${process.env.PUBLIC_URL}/assets/svg/${this.state.players[key].playerMainCharacter}.svg`} />
                        )
                      }
                    </td>
                    <td>
                    <select 
                      value={this.state.players[key].playerMainCharacter}
                      onChange={(e) => this.handleChangePlayer('playerMainCharacter', e, key)}
                      >
                        <option value=""></option>
                        {icons.map(icon =>
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        )};
                    </select>

                    </td>
                    <td>{Math.floor(this.state.players[key].playerScore)}</td>
                  </tr>
                )
              )
              }
            </tbody>
          </table>
        </form>
        </section>
        <section className="Section">
        <h2>Match</h2>
        <form onSubmit={this.addmatch.bind(this)}>
          <label htmlFor="Date">Date</label><br />
          <input 
            name="Date" 
            id="Date" 
            type="datetime-local" 
            value={this.state.datetime}
            onChange={e => this.handleChange('datetime', e)}
            ref={ el => this.inputDate = el }
          /><br />
          <label htmlFor="Players">Players</label><br />
          <table className="table">
            <tbody>
              {this.state.newMatch.map((rank, index) =>
                <tr key={index}>
                  <td>{index}</td>
                  <td>
                    <select 
                      value={rank.playerKey}
                      onChange={(e) => this.handleChangeNewMatch('playerKey', e, index)}
                      >
                        <option value=""></option>
                        {Object.keys(this.state.players).map(key => (
                          <option key={key} value={key}>{this.state.players[key].playerName}</option>
                        ))};
                    </select>
                  </td>
                  <td>
                    <select 
                      value={rank.playerCharacter}
                      onChange={(e) => this.handleChangeNewMatch('playerCharacter', e, index)}
                      >
                        <option value=""></option>
                        {icons.map(icon =>
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        )};
                    </select>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <input type="submit"/>
          <hr />
          <table className="table">
            <thead>
              <tr>
                <th>Datetime</th>
                <th>Classement</th>
              </tr>
            </thead>
            <tbody>
              { /* Render the list of matchs */
                this.state.matchs.map( match => (
                  <tr key={match.id}>
                  
                    <td>{match.matchDate}</td>
                    <td>
                      <ol>
                        { match.matchResults.map( rank => (
                          
                          <li key={rank.playerKey}>{this.state.players[rank.playerKey].playerName} ({Math.floor(rank.prevScore)} -> {Math.floor(rank.newScore)})</li>
                        ) )
                        }
                      </ol>
                    </td>
                  </tr>
                ) )
              }
            </tbody>
          </table>
        </form>
      </section>
      <section className="Schema">
        <BarChart leaderBoard={this.state.leaderBoard} players={this.state.players} matchs={this.state.matchs}/>
      </section>
      </div>
    );
  }
}

export default App;