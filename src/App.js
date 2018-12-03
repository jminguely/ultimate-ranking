import React, { Component } from 'react';
import fire from './fire';
import Select from 'react-select';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      players: {}, 
      matchs: [], 
      playersSelect: [],
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
      players[snapshot.key] = { data: snapshot.val(), id: snapshot.key };
      const playerSelect = { value: snapshot.key, label: snapshot.val().Name };
      this.setState({ 
        players: players,
        playersSelect: [playerSelect].concat(this.state.playersSelect),
      });
    })

    let matchsRef = fire.database().ref('matchs').orderByChild("Date").limitToLast(100);
    matchsRef.on('child_added', snapshot => {
      const results = snapshot.val().Results;
      let match = { 
        Date: snapshot.val().Date, 
        id: snapshot.key,
        Results: []
      };
      let ratio = 0.1;
      let rankPlayerA = 0;
      let playerAlreadyRanked = [];
      results.forEach(playerA => {
        rankPlayerA = rankPlayerA+1;
        let rankPlayerB = 0;

        results.forEach(playerB => {
          rankPlayerB = rankPlayerB+1;
          if (playerA !== playerB && playerAlreadyRanked.includes(playerB)) {
            let players = Object.assign({}, this.state.players); 
            let matchs = Object.assign({}, this.state.matchs); 


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

            // console.log(snapshot.val().Date, rankPlayerA, this.state.players[playerA].data.Name, this.state.players[playerA].data.Score, 'vs', rankPlayerB, this.state.players[playerB].data.Name, this.state.players[playerB].data.Score);
          }
        });
        match.Results.push({
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
      "Main": this.inputMain.value,
      "Score": 1000
    } );
    this.inputName.value = ''; // <- clear the input
  }
  addmatch(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    const results = this.state.selectedOption.map(item => {
      return item.value;
    });
    fire.database().ref('matchs').push( {
      "Date": this.inputDate.value,
      "Results": results
    } );
    this.inputDate.value = ''; // <- clear the input
  }

  handleChange = (field, e) => {
    this.setState({ [field]: e.target.value });
  };

  handleChangeSelect = (field, e) => {
    this.setState({ [field]: e });
  };
  
  render() {
    return (
      <div className="App">
        <section>
        <h2>Joueurs</h2>
        <form onSubmit={this.addplayer.bind(this)}>
          <label htmlFor="Name">Name</label><br />
          <input name="Name" id="Name" type="text" ref={ el => this.inputName = el }/><br />
          <label htmlFor="Main">Main</label><br />
          <input name="Main" id="Main" type="text" ref={ el => this.inputMain = el }/><br />
          <input type="submit"/>
          <hr />
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Main character</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              { /* Render the list of players */
              Object.keys(this.state.players).sort((a, b) => this.state.players[a].data.Score - this.state.players[b].data.Score).reverse().map(key => (
                  <tr key={key}>
                    <td>{this.state.players[key].data.Name}</td>
                    <td>{this.state.players[key].data.Main}</td>
                    <td>{Math.floor(this.state.players[key].data.Score)}</td>
                  </tr>
                )
              )
              }
            </tbody>
          </table>
        </form>
        </section>
        <section>
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
                    <td>{match.Date}</td>
                    <td>
                      <ol>
                        { match.Results.map( result => (
                          <li key={result.id}>{this.state.players[result.id].data.Name} ({result.currentScore})</li>
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
      </div>
    );
  }
}

export default App;