import React from 'react';
import { connect } from 'react-redux';
import Home from './pages/Home';
import Game from './pages/Game';

class Router extends React.Component {
  render() {
    switch(this.props.page) {
      case 'HOME': { return <Home/> }
      case 'GAME': { return <Game/> }
      default: {
        return (
          <h3>404: Page {this.props.page} Not Found</h3>
        )
      }
    }
  }
}

//Function to map the redux state to object properties
const mapStateToProps = (state, ownProps) => { return { page: state.route.page } };

export default connect(mapStateToProps)(Router);
