import React, {Component} from 'react';
import axios from 'axios';
import CharacterPicker from '../CharacterPicker';

class NewMatchSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leagueId: props.leagueId,
      league: props.league,
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
        leagueId: this.props.leagueId,
        league: this.props.league,
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
      newMatch[i]['playerCharacter'] = this.state.league.leaguePlayers[newMatch[i]['playerKey']].playerMainCharacter
    }

    if (newMatch.length < 8 && newMatch[newMatch.length-1].playerKey){
      newMatch.push({});
    }

    this.setState({ newMatch: newMatch });
  };
  
  addmatch(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    console.log(this.state);
    axios({
      method: 'post',
      url: 'https://us-central1-ultimate-ranking.cloudfunctions.net/addMatch',
      // url: 'http://localhost:5001/ultimate-ranking/us-central1/addMatch',
      data: {
        leagueId: this.state.leagueId,
        match: {
          matchDate: this.inputDate.value,
          matchResults: this.state.newMatch
        }

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
          <br />
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
                        {Object.keys(this.state.league.leaguePlayers).map(key => (
                          <option key={key} value={key}>{this.state.league.leaguePlayers[key].playerName}</option>
                        ))};
                    </select>
                  </td>
                  <td>
                    <CharacterPicker 
                    handleChange={(value) => this.handleChangePlayer('playerCharacter', value, index)} 
                    character={rank.playerCharacter}/>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <input type="submit"/>
        </form>
      </div>
    )
  }
}
    
export default NewMatchSection;