import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Well } from 'react-bootstrap';
import { emit } from './../../scripts/socket';
import Canvas from './../Canvas';
import HostControls from './../HostControls';
import WordSelector from './../WordSelector';
import PlayerTab  from './../PlayerTab';

class Home extends Component {
  constructor(props){
    super(props);

    this.goHome = this.goHome.bind(this);
  }

  goHome() { emit('leaveRoom'); }

  render() {
    const fakeArtist = (this.props.room.fakeArtist === this.props.myId);
    const myTurn = (this.props.room.currentTurn === this.props.myId);
    let message = (this.props.artistsWin !== undefined);
    if (message) {
      if (this.props.artistsWin) message = 'The Artists Win';
      else message = 'The Fake Wins!';
    }
    return (
      <div>
        <br/>
        {
          // Display the message for who wins, only when there is a message to display
          message && <h1>{message}</h1>
        }
        <Row>
          <Col xs={7} xsOffset={1}>
          <Button bsStyle='danger' onClick={this.goHome}>Return To Room Selection</Button>
          {
            // Only show the host controls if this user is the host for this room
            this.props.isHost &&
              <HostControls 
                minRequirementMet={this.props.room.currentOccupancy >= this.props.room.minRequired}
                gameStarted={this.props.room.gameStarted}
              />
          }
          {
            // Show this to users who are not the host while waiting for the host to start the game
            !this.props.gameStarted && !this.props.isHost &&
              <h3>Please Wait For The Host To Start The Game</h3>
          }
          {
            // When the game has started, and while the word is still being selected, show this component
            this.props.gameStarted && !this.props.wordSelected &&
              <WordSelector
                selector={this.props.room.wordSelector}
                myId={this.props.myId}
              />
          }
          {
            // Once the actual game has begun, show this component
            this.props.gameStarted && this.props.wordSelected &&
              <div>
                {
                  // Don't allow the fake artist to see the word being drawn!
                  fakeArtist ? <h2>You Are The Fake Artist</h2> : <h2>The Word To Draw Is: <b>{this.props.room.word}</b></h2>
                }
                <Canvas myTurn={myTurn}/>
                {
                  // Tell users when it is their turn to draw
                  myTurn ? <h4>Take Your Turn</h4> : <h4>Please Wait For Your Turn</h4>
                }
              </div>
          }
          </Col>
          <Col xs={3}>
            <Well>
              { 
                // This well shows all the users, and allows you to accuse them once the game starts
                this.props.room.players.map((id, i) => 
                  <PlayerTab
                    player={this.props.room.playersObj[id]}
                    key={i}
                  />
                )
              }
            </Well>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const room = state.main.rooms[state.main.inRoom];
  const host = room.host;
  const myId = state.main.myId;
  return {
    isHost: (host === myId),
    gameStarted: state.game.gameStarted,
    wordSelected: state.game.wordSelected,
    word: state.game.word,
    artistsWin: state.game.artistsWin,
    myId,
    room,
  }
}

export default connect(mapStateToProps)(Home);
