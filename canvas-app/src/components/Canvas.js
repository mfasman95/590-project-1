import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layer, Stage, Image } from 'react-konva';
import { emit } from './../scripts/socket';

class Drawing extends Component {
  constructor(props){
    super(props);
    this.state = {
      isDrawing: false,
      lineArr: [],
      canDraw: true,
    }

    this.updateCanvas = this.updateCanvas.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.drawLine = this.drawLine.bind(this);
  }

  updateCanvas(){
    for(let i = 0; i < this.props.drawing.length; i++) {
      this.drawLine(this.props.drawing[i]);
    }
    this.image.getLayer().draw();
  }

  drawLine(line){
    const { ctx } = this.state;
    const { startPos, endPos, color } = line;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.closePath();
    ctx.stroke();
  }

  componentDidUpdate(prevProps, prevState) {
    // If it has become my turn, I can now draw again
    if (!prevProps.myTurn && this.props.myTurn) this.setState({ canDraw: true });
    const prevDrawing = prevProps.drawing;
    const curDrawing = this.props.drawing;
    // If there is a current AND previous drawing array
    let curMostRecentTime = '';
    let prevMostRecentTime = '';
    if (curDrawing.length > 0) curMostRecentTime = curDrawing[curDrawing.length - 1].time;
    if (prevDrawing.length > 0) prevMostRecentTime = prevDrawing[prevDrawing.length - 1].time;
    if (prevMostRecentTime !== curMostRecentTime) this.updateCanvas();
  }

  componentDidMount() {
    const canvas = document.createElement('canvas');
    canvas.width = this.props.width;
    canvas.height = this.props.height;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.props.myColor;

    this.setState({ canvas, ctx });
  }

  handleMouseDown() {
    if (this.props.myTurn && this.state.canDraw) {
      this.setState({ isDrawing: true });
      this.lastPointerPosition = this.image.getStage().getPointerPosition();
    }
  };

  handleMouseUp() {
    if (this.props.myTurn && this.state.canDraw) {
      emit('endTurn', { line: this.state.lineArr });
      this.setState({ isDrawing: false, lineArr: [], canDraw: false });
    }
  };

  handleMouseMove({ evt }) {
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
      
      const newLine = {startPos, endPos, color: this.props.myColor, time: new Date()};
      
      this.drawLine(newLine);
      this.image.getLayer().draw();

      let newLineArr = this.state.lineArr.slice(0);
      newLineArr.push(newLine);

      this.setState({ lineArr: newLineArr });
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
  render() {
    return (
      <div>
        <br/>
        <Stage ref='stage' width={this.state.width} height={this.state.height}>
          <Layer>
            <Drawing
              drawing={this.props.drawingArray}
              width={this.state.width || 300}
              height={this.state.height || 300}
              myTurn={this.props.myTurn}
              myColor={this.props.myColor}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    drawingArray: state.canvas.drawingArray,
    myColor: state.main.color,
  }
}

export default connect(mapStateToProps)(Canvas);
