import React, {Component} from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

class LeagueSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLeagueId: props.currentLeagueId,
      leagues: [],
      authUser: this.props.authUser
    };
  }

  componentDidMount() {
    let leagues = {};

    const allPushes = Promise.all([
      new Promise((resolve, reject) => {
        this.props.firebase.leagues().orderByChild(`leagueAdmins/${btoa(this.state.authUser.email)}`).equalTo(true).on('value', snapshot => {
          if(snapshot.val()) leagues = {...leagues, ...snapshot.val()};
          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        this.props.firebase.leagues().orderByChild(`leaguePlayers/${btoa(this.state.authUser.email)}`).startAt("").on('value', snapshot => {
          if(snapshot.val()) leagues = {...leagues, ...snapshot.val()};
          resolve();
        });
      })
    ]);

    allPushes.then(() => {
      this.setState({
        leagues: leagues,
      });
    }, error => {
      console.log("error");
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        currentLeagueId: this.props.currentLeagueId
      });
    }
  }

  render(){
    return (
      <select name="currentLeagueIdSelect" id="currentLeagueIdSelect" value={this.state.currentLeagueId} onChange={(e) => this.props.handleChangeLeague(e.target.value)}>
        <option value="">Leagues list</option>
        <option value="">------------</option>
        {this.state.leagues && Object.keys(this.state.leagues).map(leagueId=> {
        const league = this.state.leagues[leagueId];
          return(
            <option key={leagueId} value={leagueId}>
              {league.leagueName}
            </option>
          )
        })}
      </select>
    )
  }
}

export default compose(
  withFirebase,
)(LeagueSelect);