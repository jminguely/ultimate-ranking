import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

import LeagueAdminPanel from './LeagueAdminPanel';

class League extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      currentLeagueId: props.currentLeagueId,
      currentLeague: undefined,
      authUser: JSON.parse(localStorage.getItem('authUser'))
    };
  }

  componentDidMount() {
    this.props.firebase.league(this.props.currentLeagueId).on('value', snapshot => {
      this.setState({
        currentLeagueId: this.props.currentLeagueId,
        currentLeague: snapshot.val(),
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.props.firebase.league(this.props.currentLeagueId).on('value', snapshot => {
        this.setState({
          currentLeagueId: this.props.currentLeagueId,
          currentLeague: snapshot.val(),
        });
      });
    }
  }

  componentWillUnmount() {
    this.props.firebase.league().off();
  }

  addLeague(e){
    e.preventDefault();
    const newLeague = this.props.firebase.leagues().push( {
      "leagueName": this.inputLeagueName.value,
      "leaguePlayers": {
        [btoa(this.state.authUser.email)]: {
          playerName: this.state.authUser.email
        }
      },
      "leagueAdmins": {
        [btoa(this.state.authUser.email)]: true
      }
    } );
    this.inputLeagueName.value = '';
    this.props.handleChangeLeague(newLeague.key);
  }

  render() {
    return (
          <div>
            <form onSubmit={this.addLeague.bind(this)}>
              <label htmlFor="leagueName">Create a new league</label><br />
              <input name="leagueName" id="leagueName" type="text" ref={ el => this.inputLeagueName = el }/><br />
              <input type="submit"/>
            </form>
            <hr />
            <div className="list-leagues">
              <div>
                {this.state.currentLeagueId !== "" && 
                this.state.currentLeague !== null && 
                this.state.currentLeague !== undefined &&
                  <>
                    <h3>League: {this.state.currentLeague.leagueName}</h3>
                    
                    <LeagueAdminPanel 
                      handleChangeSeason={this.props.handleChangeSeason}
                      handleChangeLeague={this.props.handleChangeLeague}
                      currentLeague={this.state.currentLeague}
                      currentLeagueId={this.state.currentLeagueId}
                      authUser={this.state.authUser}
                      />
                  </>
                }
              </div>
              
            </div>
          </div>
    );
  }
}


export default compose(
  withFirebase,
)(League);
