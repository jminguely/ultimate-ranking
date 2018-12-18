import React, {Component} from 'react';
import ColorPicker from '../ColorPicker';
import CharacterPicker from '../CharacterPicker';
import { withFirebase } from '../Firebase';

class LeagueAdminPanel extends Component {
  constructor(props) {
    super(props);

    this.inputs = {
      playerName: [],
      playerMail: []
    };

    this.state = { 
      currentLeagueId: props.currentLeagueId,
      currentLeague: props.currentLeague
    };

    this.handleChangePlayer = this.handleChangePlayer.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({
        currentLeagueId: this.props.currentLeagueId,
        currentLeague: this.props.currentLeague,
      });
    }
  }

  isEmail = (email = null) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(email);
  }

  addPlayer(leagueId, e){
    e.preventDefault();

    var updates = {};

    if(!this.isEmail(this.inputPlayerMail.value)) {
      alert('Adresse e-mail non valide');
      return;
    }

    updates[`/leaguePlayers/${btoa(this.inputPlayerMail.value)}`] = {
      "playerName": this.inputPlayerMail.value,
    }

    this.props.firebase.league(`${this.state.currentLeagueId}`).update(updates);

    this.inputPlayerMail.value = '';
  }

  addSeason(leagueId, e){
    e.preventDefault();
    const newSeason = this.props.firebase.leagueSeasons(`${leagueId}`).push( {
      "seasonName": this.inputSeasonName.value,
    } );
    this.inputSeasonName.value = '';
    this.props.handleChangeSeason(newSeason.key);
  }

  handleChangePlayer = (field, value, playerId) => {
    let league = Object.assign({}, this.state.currentLeague);

    league.leaguePlayers[playerId][field] = value;
    
    this.setState({ currentLeague: league });

    var updates = {};

    updates[`/leaguePlayers/${playerId}/${field}`] = value

    this.props.firebase.league(`${this.state.currentLeagueId}`).update(updates);
  };

  editPlayer = async (field, playerId, event) =>  {
    event.preventDefault();

    var updates = {};

    updates[`/leaguePlayers/${playerId}/${field}`] = this.inputs[field][playerId].value

    this.props.firebase.league(`${this.state.currentLeagueId}`).update(updates);
  }


  makePlayerAdmin (event, playerId) {
    event.preventDefault();

    var updates = {};

    updates[`/leagueAdmins/${playerId}`] = true

    this.props.firebase.league(`${this.state.currentLeagueId}`).update(updates);
  }

  unmakePlayerAdmin (event, playerId) {
    event.preventDefault();

    if (Object.keys(this.state.currentLeague.leagueAdmins).length <= 1) {
      alert("Can't revoke access of the last admin")
    }else {
      this.props.firebase.league(`${this.state.currentLeagueId}`).child(`leagueAdmins/${playerId}`).remove();
    }
  }

  removePlayer (event, playerId) {
    event.preventDefault();
    
    if (playerId in this.state.currentLeague.leagueAdmins) {
      alert("Can't remove an admin. Revoke his access first")
    }else {
      this.props.firebase.league(`${this.state.currentLeagueId}`).child(`leaguePlayers/${playerId}`).remove();
    }
  }


  render(){
    return (
      <>
        <h3>Players</h3>
            <form onSubmit={this.addPlayer.bind(this, this.state.currentLeagueId)}>
              <label htmlFor="playerMail">Add a new challenger</label><br />
              <input name="playerMail" placeholder="E-Mail address" id="playerMail" type="mail" ref={ el => this.inputPlayerMail = el }/>
              <input type="submit"/>
            </form>
              <h3>Seasons</h3>
            <form onSubmit={this.addSeason.bind(this, this.state.currentLeagueId)}>
              <label htmlFor="seasonName">Add a new season</label><br />
              <input placeholder="Season's name" name="seasonName" id="seasonName" type="text" ref={ el => this.inputSeasonName = el }/>
              <input type="submit"/>
            </form>
            <hr />
        {
          this.state.currentLeague.leaguePlayers && (
          <>
            
            <table className="table">
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Color</th>
                  <th>Main</th>
                  <th>Email</th>
                  <th>Admin</th>
                </tr>
                {Object.keys(this.state.currentLeague.leaguePlayers).map((playerId) => {
                  const player = this.state.currentLeague.leaguePlayers[playerId];
                  return (
                  <tr key={playerId}>
                    <td>
                      <form onSubmit={this.editPlayer.bind(this, 'playerName', playerId)}>
                        <input 
                          name="playerName" 
                          type="text" 
                          defaultValue={player.playerName}
                          ref={input => this.inputs['playerName'][playerId] = input} />
                          <input type="submit"/>
                      </form>
                    </td>
                    <td>
                      <ColorPicker handleChange={(value) => this.handleChangePlayer('playerColor', value, playerId)} color={player.playerColor}/>
                    </td>
                    <td>
                      <CharacterPicker handleChange={(value) => this.handleChangePlayer('playerMainCharacter', value, playerId)} character={player.playerMainCharacter}/>
                    </td>
                    <td>
                      {atob(playerId)}
                    </td>
                    <td>
                        {playerId in this.state.currentLeague.leagueAdmins ? (
                          <button onClick={ e => this.unmakePlayerAdmin(e, playerId) }>Remove admin</button>
                        ) : (
                          <button onClick={ e => this.makePlayerAdmin(e, playerId) }>Make admin</button>
                        )}
                        <button onClick={ e => this.removePlayer(e, playerId) }>Remove user</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </>
          )
        }
      </>
    )
  }
}

export default withFirebase(LeagueAdminPanel);