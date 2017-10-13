import React, { Component } from 'react';
import logo from './logo.svg';
import './css/App.css';
import Canvas from './components/Canvas';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Collab Drawing</h1>
        </header>
        <p className="App-intro">
          Start doodling with your friends!
        </p>
        <Canvas/>
      </div>
    );
  }
}

export default App;
