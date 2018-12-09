import React, {Component} from 'react';
import fire from '../../fire';
import { GithubPicker } from 'react-color';
import icons from '../../data/icons.json';

class PlayersSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: props.players
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        players: this.props.players
      });
    }
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

    handleChange = (field, e, key) => {
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
  
  render(){
    return (
      <div>
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
                          onChange={(e) => this.handleChange('playerColor', e, key)}/>
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
                      onChange={(e) => this.handleChange('playerMainCharacter', e, key)}
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
      </div>
    )
  }
}
    
export default PlayersSection;