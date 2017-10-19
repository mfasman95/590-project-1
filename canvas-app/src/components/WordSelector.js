import React, { Component } from 'react';
import { FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { emit } from './../scripts/socket';

class HostControls extends Component {
  constructor(props){
    super(props);

    this.state = { word: '' };

    this.handleText = this.handleText.bind(this);
    this.emitWord = this.emitWord.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  handleText(e) { this.setState({word: e.target.value}); }

  emitWord(){
    if(this.state.word !== ''){
      emit('selectWord', { word: this.state.word });
      this.setState({word: ''});      
    }
  }

  handleEnter(e){ if(e.key === 'Enter') this.emitWord(); }
  
  render() {
    return (
      <div>
        {
          (this.props.selector === this.props.myId) &&
            <div>
              <h3>What Should Everyone Draw?</h3>
              <FormGroup>
                <InputGroup>
                  <InputGroup.Addon>
                    Thing To Draw
                  </InputGroup.Addon>
                  <FormControl
                    type={'text'}
                    value={this.state.word}
                    onInput={this.handleText}
                    placeholder={'What should everyone draw?'}
                    onKeyPress={this.handleEnter}
                  />
                  <InputGroup.Button>
                    <Button bsStyle='success' onClick={this.emitWord} disabled={this.state.value === ''}>
                      <i className='fa fa-arrow-right'/>
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </div>
        }
        {
          (this.props.selector !== this.props.myId) &&
            <h4>Please Wait While A Word Is Selected</h4>
        }
      </div>
    );
  }
}
export default (HostControls);
