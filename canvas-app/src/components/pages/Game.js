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
          message && <h1>{message}</h1>
        }
        <Row>
          <Col xs={7} xsOffset={1}>
          <Button bsStyle='danger' onClick={this.goHome}>Return To Room Selection</Button>
          {
            this.props.isHost &&
              <HostControls 
                minRequirementMet={this.props.room.currentOccupancy >= this.props.room.minRequired}
                gameStarted={this.props.room.gameStarted}
              />
          }
          {
            !this.props.gameStarted && !this.props.isHost &&
              <h3>Please Wait For The Host To Start The Game</h3>
          }
          {
            this.props.gameStarted && !this.props.wordSelected &&
              <WordSelector
                selector={this.props.room.wordSelector}
                myId={this.props.myId}
              />
          }
          {
            this.props.gameStarted && this.props.wordSelected &&
              <div>
                {
                  fakeArtist ? <h2>You Are The Fake Artist</h2> : <h2>The Word To Draw Is: <b>{this.props.room.word}</b></h2>
                }
                <Canvas myTurn={myTurn}/>
                {
                  myTurn ? <h4>Take Your Turn</h4> : <h4>Please Wait For Your Turn</h4>
                }
              </div>
          }
          </Col>
          <Col xs={3}>
            <Well>
              { this.props.room.players.map((id, i) => 
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
