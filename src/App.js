import React, { Component } from 'react';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import './App.css';

class Node extends Component {
  constructor(props) {
    super(props)   
  }

  render() {
    return (
      <rect
        className="node-rect"
        ry="10"
        rx="10"
        x="0"
        y="0"
        width={this.props.width}
        height={this.props.height}
        fill="gray"
      >
      </rect>            
    );
  }
}

Node.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

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
            <Node 
              width={200}
              height={50}
              />
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
