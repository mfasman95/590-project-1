import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Well, Col } from 'react-bootstrap';
import RoomButton from './../RoomButton';
import CreateRoom from './../CreateRoom';

class Rooms extends Component {
  render() {
    const hasRooms = Object.keys(this.props.rooms).length > 0;
    return (
      <Col xs={10} xsOffset={1}>
        <h1>Welcome <b>{this.props.name}</b></h1>
        <h2>Create A Room!</h2>
        <CreateRoom />
        <h2>Enter A Room!</h2>
        <Well className={hasRooms ? 'roomWell' : ''}>
          {
            !hasRooms &&
              <h3><b>No Rooms Currently Exist</b></h3>
          }
          {
            hasRooms && Object.keys(this.props.rooms).map((key, i) => 
              <RoomButton room={this.props.rooms[key]} key={i} />
            )
          }
        </Well>
      </Col>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    rooms: state.main.rooms,
    name: state.main.name,
  }
}

export default connect(mapStateToProps)(Rooms);
