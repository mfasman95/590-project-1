import React, { Component } from 'react';
import { Col, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { emit } from './../../scripts/socket';

class Rooms extends Component {
  constructor(props){
    super(props);

    this.state = { name: '' };

    this.handleName = this.handleName.bind(this);
    this.emitName = this.emitName.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  handleName(e) { this.setState({name: e.target.value}); }

  emitName(){
    if(this.state.word !== ''){
      emit('setName', { name: this.state.name });
      this.setState({name: ''});      
    }
  }

  handleEnter(e){ if(e.key === 'Enter') this.emitName(); }

  render() {
    return (
      <Col xs={10} xsOffset={1}>
        <h3>Set Your Name</h3>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              Name
            </InputGroup.Addon>
            <FormControl
              type={'text'}
              value={this.state.name}
              onInput={this.handleName}
              placeholder={'Write Your Name Here'}
              onKeyPress={this.handleEnter}
            />
            <InputGroup.Button>
              <Button bsStyle='success' onClick={this.emitName} disabled={this.state.value === ''}>
                <i className='fa fa-arrow-right'/>
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </Col>
    );
  }
}

export default (Rooms);
