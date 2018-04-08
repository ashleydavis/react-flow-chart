import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class Node extends Component {
  render() {
    return (
      <rect
        class="node-rect"
        ry="10"
        rx="10"
        x="0"
        y="0"
        width="150"
        height="50"
        fill="gray"
      >
      </rect>            
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div>
          <svg>
            <Node />
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
