class Room {
  constructor(name) {
    this.name = name;
    this.maxOccupancy = 8;
    this.minRequired = 4;
    this.gameStarted = false;
    this.word = '';
    this.players = [];
    this.playersObj = {};
    this.currentOccupancy = this.players.length;
    this.drawingArray = [];
  }

  addPlayer(socket) {
    if (this.currentOccupancy < this.maxOccupancy) {
      this.players.push(socket.id);
      this.playersObj[socket.id] = {
        id: socket.id,
        color: socket.color,
        name: socket.name,
      };
      this.currentOccupancy = this.players.length;
      // Host has the ability to start/end the game
      if (this.currentOccupancy === 1) { this.host = socket.id; }
      return true;
    }
    return false;
  }
  // This function returns true if the game was forced to end
  removePlayer(socketId) {
    // If the host is leaving, wipe the room
    // Otherwise, just remove that user
    if (this.host === socketId) {
      this.players = [];
      this.drawingArray = [];
      this.currentOccupancy = 0;
      this.gameStarted = false;
      return false;
    } else if (this.players.includes(socketId)) {
      this.players.splice(this.players.indexOf(socketId), 1);
      this.currentOccupancy = this.players.length;
      // If the game is currently going, we might need to end it
      if (this.gameStarted) {
        console.log('Blah1', this.fakeArtist, socketId, this.currentOccupancy, this.minRequired);
        // If the fake artist quits or the room doesn't have enough to continue the games, end the game
        if (this.fakeArtist === socketId || this.currentOccupancy < this.minRequired) {
          console.log('blah2');
          this.endGame();
          return true;
        }
      }
      return false;
    }
    return false;
  }

  setWord(word) {
    this.word = word;
    // When the word is set, also randomly select the fake artist
    this.fakeArtist = `${this.wordSelector}`;
    // Keep reselecting until you have not chosen the word selector
    while (this.fakeArtist === this.wordSelector) {
      this.fakeArtist = this.randomPlayer();
    }
    // Set who has the current turn
    this.currentTurn = this.randomPlayer();
  }

  nextTurn() {
    // Increment to the next player in the array for turn order
    const currentTurnIndex = this.players.indexOf(this.currentTurn) + 1;
    // Avoid index out of range by looping the selector
    if (currentTurnIndex >= this.players.length) {
      this.currentTurn = this.players[0];
    } else this.currentTurn = this.players[currentTurnIndex];
  }

  startGame() {
    this.gameStarted = true;
    // Reset the fake artist
    if (this.fakeArtist) delete this.fakeArtist;
    // Reset the selected word
    this.word = '';
    // Select a random player to be the one choosing the word
    this.wordSelector = this.randomPlayer();
  }
  endGame() {
    this.gameStarted = false;
    // Clear the stored canvas
    this.drawingArray = [];
    // Reset the fake artist
    if (this.fakeArtist) delete this.fakeArtist;
    // Reset the selected word
    this.word = '';
    // No player should be marked as choosing the word
    if (this.wordSelector) delete this.wordSelector;
  }

  accuse(playerId) {
    const success = (this.fakeArtist === playerId);
    this.endGame();
    return success;
  }

  addLine(line) { this.drawingArray = this.drawingArray.concat(line); }
  clearDrawing() { this.drawingArray = []; }
  randomPlayer() { return this.players[Math.floor(Math.random() * this.players.length)]; }
}

module.exports = Object.freeze({
  Room,
});
