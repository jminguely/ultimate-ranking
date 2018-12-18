import React, {Component} from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

class SeasonSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLeagueId: props.currentLeagueId,
      currentSeasonId: props.currentSeasonId,
      seasons: [],
      authUser: this.props.authUser
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.props.firebase.leagueSeasons(this.props.currentLeagueId).on('value', snapshot => {
        this.setState({
          seasons: snapshot.val(),
          currentLeagueId: this.props.currentLeagueId,
          currentSeasonId: this.props.currentSeasonId
        });
      });
    }
  }

  render(){
    return (
      <select name="currentseasonIdSelect" id="currentseasonIdSelect" value={this.state.currentSeasonId} onChange={(e) => this.props.handleChangeSeason(e.target.value)}>
        <option value="">Seasons list</option>
        <option value="">------------</option>
        {this.state.seasons && Object.keys(this.state.seasons).map(seasonId=> {
        const league = this.state.seasons[seasonId];
          return(
            <option key={seasonId} value={seasonId}>
              {league.seasonName}
            </option>
          )
        })}
      </select>
    )
  }
}

export default compose(
  withFirebase,
)(SeasonSelect);