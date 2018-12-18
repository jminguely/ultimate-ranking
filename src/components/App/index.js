import React, {Component} from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home.js';
import LeaguePage from '../League';
import SeasonPage from '../Season';
import AccountPage from '../Account';
import AdminPage from '../Admin';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

import './style.scss';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      currentLeagueId: "-LTg0RVknolCWJ05FbEz",
      currentSeasonId: "",
    };

    this.handleChangeLeague = this.handleChangeLeague.bind(this);
    this.handleChangeSeason = this.handleChangeSeason.bind(this);
  }

  handleChangeLeague(currentLeagueId) {
    this.setState({
      currentLeagueId: currentLeagueId
    });
  }

  handleChangeSeason(currentSeasonId) {
    this.setState({
      currentSeasonId: currentSeasonId
    });
  }

  render(){
    return (
      <Router>
        <div>
          <Navigation 
            handleChangeSeason={this.handleChangeSeason}
            handleChangeLeague={this.handleChangeLeague}
            currentSeasonId={this.state.currentSeasonId}
            currentLeagueId={this.state.currentLeagueId} />
          <hr />
          <div className="container">
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
            <Route path={ROUTES.SIGN_IN} component={SignInPage} />
            <Route
              path={ROUTES.PASSWORD_FORGET}
              component={PasswordForgetPage}
            />
            <Route path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.ACCOUNT} component={AccountPage} />
            <Route path={ROUTES.ADMIN} component={AdminPage} />
            <Route
              path={ROUTES.LEAGUE}
              render={(props) => 
                <LeaguePage {...props} 
                  currentLeagueId={this.state.currentLeagueId} 
                  currentSeasonId={this.state.currentSeasonId}
                  handleChangeSeason={this.handleChangeSeason}
                  handleChangeLeague={this.handleChangeLeague}
                />}
            />
            <Route
              path={ROUTES.SEASON}
              render={(props) => 
                <SeasonPage {...props} 
                  currentLeagueId={this.state.currentLeagueId} 
                  currentSeasonId={this.state.currentSeasonId}
                />}
            />
          </div>
        </div>
      </Router>
    )
  }
}


export default withAuthentication(App);