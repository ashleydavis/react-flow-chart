import React, { Component } from 'react';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import './App.css';

//
// Adapted to SVG from here: https://stackoverflow.com/a/20927899/25868
// This is very cool. I've also adapted to contain children and make them draggable.
//
class Draggable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            x: this.props.x,
            y: this.props.y,
            dragging: false,
            rel: null // position relative to the cursor
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    // etc.
    componentDidUpdate (props, state) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        } 
        else if (!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    }

    // calculate relative position to the mouse and set dragging=true
    onMouseDown (e) {
        // only left mouse button
        if (e.button !== 0) {
            return;
        }

        this.setState({
            dragging: true,
            rel: {
                x: e.pageX - this.state.x,
                y: e.pageY - this.state.y
            }
        });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseUp (e) {
        
        this.setState({ dragging: false });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove (e) {
        if (!this.state.dragging) {
            return;
        }

        this.setState({
            x: e.pageX - this.state.rel.x,
            y: e.pageY - this.state.rel.y
        });

        e.stopPropagation();
        e.preventDefault();
    }
    
    render () {
        const x = this.state.x;
        const y = this.state.y;
        //TODO: Why can't I just include this directly in the DOM below???
        const translate = `translate(${x}, ${y})`;
        return (
            <g
                transform={translate}
                onMouseDown={this.onMouseDown}
                >
                {this.props.children}
            </g>
        );
    }
}

Draggable.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
};

class Node extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const x = this.props.x;
        const y = this.props.y;
        return (
            <Draggable
                x={x}
                y={y}
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
                    x={this.props.width / 2}
                    y="25"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                </text>
            </Draggable>
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
