import React, { Component } from 'react';
import { compose } from 'recompose';
import { withAuthorization } from './Session';
import { withFirebase } from './Firebase';
import { AuthUserContext } from './Session';

class Home extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          <div>
            <h1>Home</h1>
            Bienvenue {authUser.email}
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
)(Home);
