import React, {Component} from 'react';
import { Link } from 'react-router-dom';

import LeagueSelect from '../LeagueSelect';
import SeasonSelect from '../SeasonSelect';
import { AuthUserContext } from '../Session';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

import './style.scss';


class Navigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLeagueId: props.currentLeagueId,
      currentSeasonId: props.currentSeasonId,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        currentLeagueId: this.props.currentLeagueId,
        currentSeasonId: this.props.currentSeasonId,
      });
    }
  }

  render(){
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          authUser ? (
            
            <nav className="navigation">
              <ul>
                <li>
                  <Link to={ROUTES.HOME}>Home</Link>
                </li>
                <li>
                  <Link to={ROUTES.LEAGUE}>League</Link>
                </li>
                <li>
                  <Link to={ROUTES.SEASON}>Season</Link>
                </li>
                <li>
                  <Link to={ROUTES.ACCOUNT}>Account</Link>
                </li>
                <li>
                  <SignOutButton />
                </li>
                <li>
                  <LeagueSelect authUser={authUser} handleChangeLeague={this.props.handleChangeLeague} currentLeagueId={this.state.currentLeagueId} />
                </li>
                <li>
                  <SeasonSelect authUser={authUser} handleChangeSeason={this.props.handleChangeSeason} currentLeagueId={this.state.currentLeagueId} currentSeasonId={this.state.currentSeasonId} />
                </li>
              </ul>
            </nav>
          ) : (
            <nav className="navigation">
              <ul>
                <li>
                  <Link to={ROUTES.LANDING}>Landing</Link>
                </li>
                <li>
                  <Link to={ROUTES.SIGN_IN}>Sign In</Link>
                </li>
              </ul>
            </nav>
          )
        }
      </AuthUserContext.Consumer>
    )
  }
}


export default Navigation;