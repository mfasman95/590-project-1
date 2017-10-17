class Room {
  constructor(name) {
    this.name = name;
    this.maxOccupancy = 8;
    this.gameStarted = false;
    this.word = '';
    this.players = [];
    this.currentOccupancy = Object.keys(this.players).length;
    this.drawingArray = [];
  }

  addPlayer(socketId) {
    if (this.currentOccupancy < this.maxOccupancy) {
      this.players.push(socketId);
      this.currentOccupancy = Object.keys(this.players).length;
      return true;
    }
    return false;
  }
  removePlayer(socketId) {
    if (this.players.includes(socketId)) {
      this.players.splice(this.players.indexOf(socketId), 1);
      this.currentOccupancy = Object.keys(this.players).length;
    }
  }

  setWord(word) { this.word = word; }

  startGame() { this.gameStarted = true; }
  endGame() { this.gameStarted = false; }

  addLine(line) { this.drawingArray.push(line); }
  clearDrawing() { this.drawingArray = []; }
}

module.exports = Object.freeze({
  Room,
});
