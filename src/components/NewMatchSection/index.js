import React, {Component} from 'react';
import icons from '../../data/icons.json';
import axios from 'axios';

class NewMatchSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: props.players,
      matchs: props.matchs,
      newMatch: [{}],
      datetime: this.getDate() 
    };

    setInterval(() => {
      this.setState({
        datetime: this.getDate() 
      });
    }, 60000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        players: this.props.players,
        matchs: this.props.matchs

      });
    }
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

    this.setState({ newMatch: [{}] });

  }

  

  
  render(){
    return (
      <div>
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
      </div>
    )
  }
}
    
export default NewMatchSection;