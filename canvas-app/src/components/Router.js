import React from 'react';
import { connect } from 'react-redux';
import Name from './pages/Name';
import Rooms from './pages/Rooms';
import Game from './pages/Game';

class Router extends React.Component {
  render() {
    switch(this.props.page) {
      case 'NAME': { return <Name/> }
      case 'ROOMS': { return <Rooms/> }
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
