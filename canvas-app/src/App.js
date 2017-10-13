import React, { Component } from 'react';
import logo from './logo.svg';
import './css/App.css';
import Router from './components/Router';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Collab Drawing</h1>
        </header>
        <Router/>
      </div>
    );
  }
}

export default App;
