import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { emit } from './../scripts/socket';

class RoomButton extends Component {
  constructor(props){
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(){
    emit('joinRoom', {
      roomName: this.props.room.name,
    });
  }
  render() {
    const room = this.props.room;
    let canEnter = true;
    if (room.currentOccupancy >= room.maxOccupancy) canEnter = false;
    else if (room.gameStarted) canEnter = false;
    return (
      <Button
        className='room-button'
        bsStyle={canEnter ? 'success' : 'danger'}
        bsSize='large'
        onClick={this.handleClick}
        disabled={!canEnter}
      >
        <h4>Room: <b className='room-details'>{room.name}</b></h4>
        <h5>Occupancy: <b className='room-details'>{room.currentOccupancy}/{room.maxOccupancy}</b></h5>
      </Button>
    );
  }
}
export default (RoomButton);
