import React, { Component } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { emit } from './../scripts/socket';

class HostControls extends Component {
  constructor(props){
    super(props);

    this.startGame = this.startGame.bind(this);
  }

  startGame(){ emit('startGame'); }
  
  render() {
    return (
      <div>
        <h3><b>You Are The Host</b></h3>
        {
          this.props.minRequirementMet &&
            <ButtonGroup>
              {
                !this.props.gameStarted &&
                  <Button
                    bsStyle='success'
                    onClick={this.startGame}
                  >
                    Start New Game
                  </Button>
              }
            </ButtonGroup>
        }
        {
          !this.props.minRequirementMet &&
            <h4>Not Enough Players To Start The Game</h4>
        }
      </div>
    );
  }
}
export default (HostControls);
