import React, { Component } from 'react';
import { compose } from 'recompose';
import { withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';

class Season extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      currentLeagueId: props.currentLeagueId,
      currentLeague: undefined,
      currentSeasonId: props.currentSeasonId,
      currentSeason: undefined,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.firebase.league(this.props.currentLeagueId).on('value', snapshot => {
      this.setState({
        currentLeagueId: this.props.currentLeagueId,
        currentSeasonId: this.props.currentSeasonId,
        currentLeague: snapshot.val(),
        currentSeason: this.props.currentSeasonId ? snapshot.val().leagueSeasons[this.props.currentSeasonId] : undefined
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.props.firebase.league(this.props.currentLeagueId).on('value', snapshot => {
        this.setState({
          currentLeagueId: this.props.currentLeagueId,
          currentSeasonId: this.props.currentSeasonId,
          currentLeague: snapshot.val(),
          currentSeason: this.props.currentSeasonId ? snapshot.val().leagueSeasons[this.props.currentSeasonId] : undefined
        });
      });
    }
  }

  componentWillUnmount() {
    this.props.firebase.leagues().off();
  }

  addLeague(e){
    e.preventDefault();
    this.props.firebase.leagues().push( {
      "leagueName": this.inputLeagueName.value,
      "leagueAdmins": {
        [this.state.authUser.uid]: true
      }
    } );
    this.inputLeagueName.value = '';
  }

  addPlayer(leagueId, e){
    e.preventDefault();
    this.props.firebase.leaguePlayers(`${leagueId}`).push( {
      "playerName": this.inputPlayerName.value,
    } );
    this.inputPlayerName.value = '';
  }

  addSeason(leagueId, e){
    e.preventDefault();
    this.props.firebase.leagueSeasons(`${leagueId}`).push( {
      "seasonName": this.inputSeasonName.value,
    } );
    this.inputSeasonName.value = '';
  }

  handleChange(event){
    this.setState({currentSeason: event.target.value});
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          <div>
          <h1>Season</h1>
          {
            this.state.currentLeague &&
            <>
              <h2>League: {this.state.currentLeague.leagueName}</h2>
              {this.state.currentSeasonId && this.state.currentSeason &&
                <div>
                  <h2>Season: {this.state.currentSeason.seasonName}</h2>

                  Add match

                  Show barchart
                </div>

                
              }
            </>
          }
          
          {/* {this.state.currentLeague.leagueName} */}
            <div>
              {/* {this.state.currentLeague !== "" && this.state.leagues[this.state.currentLeague] !== undefined &&
                <>
                  <h3>League: {this.state.leagues[this.state.currentLeague].leagueName}</h3>
                  {
                    this.state.leagues[this.state.currentLeague].leaguePlayers && (
                    <>
                      <h3>Seasons</h3>
                      <form onSubmit={this.addSeason.bind(this, this.state.currentLeague)}>
                        <label htmlFor="seasonName">Launch a new season</label><br />
                        <input name="seasonName" id="seasonName" type="text" ref={ el => this.inputSeasonName = el }/>
                        <input type="submit"/>
                      </form>
                      <h2>Show me a season</h2>
                        <select name="currentSeasonSelect" value={this.state.currentSeason} onChange={this.handleChange}>
                          {JSON.stringify(this.state.leagues[this.state.currentLeague].leagueSeasons)}
                          <option value=""></option>
                          {this.state.leagues[this.state.currentLeague].leagueSeasons && Object.keys(this.state.leagues[this.state.currentLeague].leagueSeasons).map(leagueId=> {
                          const league = this.state.leagues[this.state.currentLeague].leagueSeasons[leagueId];
                            return(
                              <option key={leagueId} value={leagueId}>
                                {league.seasonName}
                              </option>
                            )
                          })}
                        </select>
                        {this.state.currentSeason !== "" && this.state.leagues[this.state.currentLeague].leagueSeasons[this.state.currentSeason] !== undefined &&
                          <>
                            <h3>League: {this.state.leagues[this.state.currentLeague].leagueSeasons[this.state.currentSeason].seasonName}</h3>
                          </>
                        }
                    </>
                    )
                  }
                </>
              } */}
            </div>
          </div>
          }
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser =>
  authUser;

export default compose(
  withFirebase,
  withAuthorization(condition),
)(Season);
