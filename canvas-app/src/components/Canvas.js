import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layer, Stage, Image } from 'react-konva';
import { emit } from './../scripts/redux';
import { Button } from 'react-bootstrap';

const random0to255 = () => Math.floor(Math.random() * 255);
const randomColor = () => `rgb(${random0to255()},${random0to255()},${random0to255()})`;

const myColor = randomColor();

class Drawing extends Component {
  constructor(props){
    super(props);
    this.state = {
      isDrawing: false,
    }

    this.updateCanvas = this.updateCanvas.bind(this);
  }

  updateCanvas(){
    const { ctx, canvas } = this.state;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < this.props.drawing.length; i++){
      const { startPos, endPos, color } = this.props.drawing[i];
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.closePath();
      ctx.stroke();
    }
    this.image.getLayer().draw();
  }

  componentDidMount() {
    const canvas = document.createElement("canvas");
    canvas.width = this.props.width;
    canvas.height = this.props.height;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = myColor;

    this.setState({ canvas, ctx });

    // TODO: Find a better solution
    setInterval(this.updateCanvas, 1000/120); // Update at frame rate
  }

  handleMouseDown = () => {
    this.setState({ isDrawing: true });
    this.lastPointerPosition = this.image.getStage().getPointerPosition();
  };

  handleMouseUp = () => {
    this.setState({ isDrawing: false });
  };

  handleMouseMove = ({ evt }) => {
    const { isDrawing } = this.state;

    if (isDrawing) {
      const startPos = {
        x: this.lastPointerPosition.x - this.image.x(),
        y: this.lastPointerPosition.y - this.image.y()
      };
      const pointerPos = this.image.getStage().getPointerPosition();
      const endPos = {
        x: pointerPos.x - this.image.x(),
        y: pointerPos.y - this.image.y()
      };
      this.lastPointerPosition = pointerPos;
      const newLine = {startPos, endPos, color: myColor};

      emit('lineDraw', { newLine });
    }
  };

  render() {
    return (
      <Image
        image={this.state.canvas}
        ref={node => (this.image = node)}
        width={this.props.width}
        height={this.props.width}
        stroke="black"
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      />
    );
  }
}

class Canvas extends Component {
  state = {
    width: 300,
    height: 300,
  }
  clearCanvas(){ emit('clearCanvas'); }

  render() {
    return (
      <div>
        <Button bsStyle='primary' bsSize='large' onClick={this.clearCanvas}>Clear Canvas</Button>
        <br/>
        <br/>
        <Stage ref='stage' width={this.state.width} height={this.state.height}>
          <Layer>
            <Drawing
              drawing={this.props.drawingArray}
              width={this.state.width || 300}
              height={this.props.height || 300}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    drawingArray: state.drawingArray,
  }
}

export default connect(mapStateToProps)(Canvas);
