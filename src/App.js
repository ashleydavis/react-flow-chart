import React, { Component } from 'react';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import './App.css';

class Node extends Component {
  constructor(props) {
    super(props)   
  }

  render() {
    const x = this.props.x;
    const y = this.props.y;
    //TODO: Why can't I just include this directly in the DOM below???
    const translate = `translate(${x}, ${y})`;
    return (
      <g
        transform={translate}
        >
        <rect
          className="node-rect"
          ry="10"
          rx="10"
          x="0"
          y="0"
          width={this.props.width}
          height={this.props.height}
          fill="gray"
        />
        <text
            x={this.props.width/2}
            y="25"
            textAnchor="middle"
            alignmentBaseline="middle"
            >      
            {this.props.name}          
          </text>
      </g>
    );
  }
}

Node.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
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
          <svg
            width={600}
            height={600}
            >
            <Node 
              x={120}
              y={75}
              width={200}
              height={50}
              name="Test node"
              />
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
