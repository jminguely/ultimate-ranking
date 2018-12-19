import React, { Component } from 'react';
import { compose } from 'recompose';
import { withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import BarChart from '../BarChart';
import NewMatch from '../NewMatch';
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
    this.props.firebase.league().off();
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

                    <NewMatch 
                      leagueId={this.state.currentLeagueId}
                      league={this.state.currentLeague}
                    />

                    <hr />
                    <h3>Matchs</h3>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Datetime</th>
                          <th>Classement</th>
                        </tr>
                      </thead>
                      <tbody>
                        { /* Render the list of matchs */
                          Object.keys(this.state.currentLeague.leagueMatchs).map( match => (
                            <tr key={match}>
                            
                              <td>{this.state.currentLeague.leagueMatchs[match].matchDate}</td>
                              <td>
                                <ol>
                                  { this.state.currentLeague.leagueMatchs[match].matchResults.map( rank => (
                                    
                                    <li key={rank.playerKey}>{this.state.currentLeague.leaguePlayers[rank.playerKey].playerName} ({Math.floor(rank.prevScore)} -> {Math.floor(rank.newScore)})</li>
                                  ) )
                                  }
                                </ol>
                              </td>
                            </tr>
                          ) )
                        }
                      </tbody>
                    </table>
                    <br />
                    <hr />
                    <br />
                    <h3>Barcharts</h3>
                    <BarChart league={this.state.currentLeague}/>
                  </div>
                }
              </>
            }
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
