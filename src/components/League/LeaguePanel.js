import React, {Component} from 'react';
import ColorPicker from '../ColorPicker';
import { withFirebase } from '../Firebase';

class LeaguePanel extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      currentLeagueId: props.currentLeagueId,
      currentLeague: props.currentLeague
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({
        currentLeagueId: this.props.currentLeagueId,
        currentLeague: this.props.currentLeague,
      });
    }
  }

  render(){
    return (
      <>
        <h3>Players</h3>
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
                </tr>
                {Object.keys(this.state.currentLeague.leaguePlayers).map((playerId) => {
                  const player = this.state.currentLeague.leaguePlayers[playerId];
                  return (
                  <tr key={playerId}>
                    <td>
                      {player.playerName}
                    </td>
                    <td>
                      <div className="colorPreview" style={{background: player.playerColor, width: '1em', height: '1em', border: '1px solid black'}}></div>
                    </td>
                    <td>
                      {player.playerMainCharacter}
                    </td>
                    <td>
                      {atob(playerId)}
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

export default withFirebase(LeaguePanel);