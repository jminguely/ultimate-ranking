import React, { Component } from 'react';
import fire from './fire';
import Select from 'react-select';
import './App.scss';
import BarChart from './components/BarChart';
import { GithubPicker } from 'react-color';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      colors: {},
      players: {}, 
      matchs: [], 
      playersSelect: [],
      teamRanked: {},
      selectedOption: null,
      datetime: `${new Date().getFullYear()}-${`${new Date().getMonth() +
        1}`.padStart(2, 0)}-${`${new Date().getDay() + 1}`.padStart(
        2,
        0
      )}T${`${new Date().getHours()}`.padStart(
        2,
        0
      )}:${`${new Date().getMinutes()}`.padStart(2, 0)}`
    }; // <- set up react state¨
  }
  componentWillMount(){
    /* Create reference to players in Firebase Database */
    let playersRef = fire.database().ref('players').orderByKey().limitToLast(100);
    playersRef.on('child_added', snapshot => {
      /* Update React state when player is added at Firebase Database */
      let players = Object.assign({}, this.state.players); 
      let teamRanked = Object.assign({}, this.state.teamRanked); 
      let colors = Object.assign({}, this.state.colors); 
      const playerSelect = { value: snapshot.key, label: snapshot.val().Name };
      
      colors[snapshot.key] = snapshot.val().Color;

      players[snapshot.key] = { data: snapshot.val(), id: snapshot.key, ranking: [] };
      
      teamRanked[snapshot.key] = [];

      this.setState({ 
        colors: colors,
        teamRanked: teamRanked,
        players: players,
        playersSelect: [playerSelect].concat(this.state.playersSelect),
      });
    })

    let matchsRef = fire.database().ref('matchs').orderByChild("Date").limitToLast(100);
    matchsRef.on('child_added', snapshot => {
      const matchResults = snapshot.val().matchResults;
      let match = { 
        matchDate: snapshot.val().matchDate, 
        id: snapshot.key,
        matchResults: []
      };
      let ratio = 0.1;
      let rankPlayerA = 0;
      let playerAlreadyRanked = [];
      matchResults.forEach(playerA => {
        rankPlayerA = rankPlayerA+1;
        let rankPlayerB = 0;

        matchResults.forEach(playerB => {
          rankPlayerB = rankPlayerB+1;
          if (playerA !== playerB && playerAlreadyRanked.includes(playerB)) {
            let players = Object.assign({}, this.state.players); 

            const misePlayerA = ratio * this.state.players[playerA].data.Score;
            const misePlayerB = ratio * this.state.players[playerB].data.Score;

            if (rankPlayerA < rankPlayerB) {
              players[playerA].data.Score = players[playerA].data.Score + misePlayerB;
              players[playerB].data.Score = players[playerB].data.Score - misePlayerB;
            } else {
              players[playerA].data.Score = players[playerA].data.Score - misePlayerA;
              players[playerB].data.Score = players[playerB].data.Score + misePlayerA;
            }

            this.setState({
              players: players
            });

          }
        });

        let tempRank = [];

        Object.keys(this.state.players).forEach(key => {
          tempRank.push({
            id: key,
            score: this.state.players[key].data.Score
          });
        });

        let i = 0;
        let teamRanked = Object.assign({}, this.state.teamRanked); 

        tempRank.sort((a, b) => a.score - b.score).reverse().forEach(item => {
          i++;
          teamRanked[item.id].push(i);
        });

        this.setState({ teamRanked: teamRanked });

        match.matchResults.push({
          id: playerA,
          currentScore: this.state.players[playerA].data.Score
        });
        playerAlreadyRanked.push(playerA);
      });
      
      this.setState({ matchs: [match].concat(this.state.matchs) });
    })
  }
  addplayer(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the player to Firebase */
    fire.database().ref('players').push( {
      "Name": this.inputName.value,
      "Score": 1000,
      "Color": '#ffffff'
    } );
    this.inputName.value = ''; // <- clear the input
  }
  addmatch(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    const matchResults = this.state.selectedOption.map(item => {
      return item.value;
    });


    axios({
      method: 'post',
      url: 'http://localhost:5001/ultimate-ranking/us-central1/addMatch',
      data: {
        matchDate: this.inputDate.value,
        matchResults: matchResults,
      },
      headers: {
          'Content-Type': 'text/plain;charset=utf-8',
      },
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log(error);
    });

  }

  handleChange = (field, e) => {
    this.setState({ [field]: e.target.value });
  };

  handleChangePlayer = (field, e, key) => {
    let players = Object.assign({}, this.state.players);

    players[key].data.Color = e.hex;

    this.setState({ players: players });

      var updates = {};

      updates['/players/' + key] = players[key].data

      fire.database().ref().update(updates)
  };

  handleChangeSelect = (field, e) => {
    this.setState({ [field]: e });
  };

  render() {
    return (
      <div className="App">
        <section className="Section">
        <h2>Joueurs</h2>
        <form onSubmit={this.addplayer.bind(this)}>
          <label htmlFor="Name">Name</label><br />
          <input name="Name" id="Name" type="text" ref={ el => this.inputName = el }/><br />
          <input type="submit"/>
          <hr />
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Color</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              { /* Render the list of players */
              Object.keys(this.state.players).sort((a, b) => this.state.players[a].data.Score - this.state.players[b].data.Score).reverse().map(key => (
                  <tr key={key}>
                    <td>{this.state.players[key].data.Name}</td>
                    <td>
                      <div className="colorPlayer" style={{background: this.state.players[key].data.Color, width: '1em', height: '1em', border: '1px solid black'}}>
                        <GithubPicker 
                          className="colorPicker"
                          color={ this.state.players[key].data.Color }
                          onChange={(e) => this.handleChangePlayer('color', e, key)}/>
                      </div>
                    </td>
                    <td>{Math.floor(this.state.players[key].data.Score)}</td>
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
          <Select
            name="Players"
            id="Players"
            value={ this.state.selectedOption }
            options={this.state.playersSelect}
            onChange={e => this.handleChangeSelect('selectedOption', e)}
            isMulti={true}
          />
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
                        { match.matchResults.map( result => (
                          <li key={result.id}>{this.state.players[result.id].data.Name}</li>
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

        {/* <table className="table">
          <tbody>
            {
            Object.keys(this.state.teamRanked).sort((a, b) => this.state.players[a].data.Score - this.state.players[b].data.Score).reverse().map(keyPlayer => (
                <tr key={keyPlayer}>
                  <th>{this.state.players[keyPlayer].data.Name}</th>

                  {this.state.teamRanked[keyPlayer].map(item => (                      
                    <td>{item}</td>
                  ))}

                  
                </tr>
              )
            )
            }
          </tbody>
        </table> */}
        <BarChart players={this.state.players} data={this.state.teamRanked} colors={this.state.colors} finalRank={Object.keys(this.state.teamRanked).sort((a, b) => this.state.players[a].data.Score - this.state.players[b].data.Score).reverse()} id="barCharts" />
      </section>
      </div>
    );
  }
}

export default App;