import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Panel } from 'react-bootstrap';
import { emit } from './../scripts/socket';

class RoomButton extends Component {
  constructor(props){
    super(props);

    this.handleAccuse = this.handleAccuse.bind(this);
  }

  handleAccuse(){ emit('accusePlayer', { player: this.props.player.id }); }
  
  render() {
    const { player, fakeArtist, myId, gameStarted } = this.props;
    return (
      <Panel style={{backgroundColor: player.color}}>
        <p><b>{player.name}</b></p>
        {
          gameStarted && (fakeArtist !== myId) &&
            <Button
              className='player-tab'
              bsStyle={'danger'}
              onClick={this.handleAccuse}
            >
              Accuse {player.name}!
            </Button>
        }
      </Panel>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const room = state.main.rooms[state.main.inRoom];
  const gameStarted = (room.fakeArtist !== undefined);
  return {
    gameStarted,
    fakeArtist: room.fakeArtist,
    myId: state.main.myId,
  }
}

export default connect(mapStateToProps)(RoomButton);
