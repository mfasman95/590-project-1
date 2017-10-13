import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { emit } from './../scripts/socket';

class CreateRoom extends React.Component {
  constructor(props){
    super(props);

    this.state = { value: '' }

    this.HI_RoomName = this.HI_RoomName.bind(this);
    this.emitRoom = this.emitRoom.bind(this);
  }

  HI_RoomName(e){
    this.setState({value: e.target.value});
  }

  emitRoom(){
    emit('createRoom', { roomName: this.state.value });
    this.setState({value: ''});
  }

  render() {
    return (
      <FormGroup>
        <InputGroup>
          <InputGroup.Addon>
            Room Name
          </InputGroup.Addon>
          <FormControl
            type={'text'}
            value={this.state.value}
            onInput={this.HI_RoomName}
            placeholder={'Type The Room Name Here'}
          />
          <InputGroup.Button>
            <Button bsStyle='success' onClick={this.emitRoom}>
              <i className='fa fa-arrow-right'/>
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }
}

//Function to map the redux state to object properties
const mapStateToProps = (state, ownProps) => { return { } };

export default connect(mapStateToProps)(CreateRoom);
