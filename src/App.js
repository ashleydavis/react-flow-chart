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
        
        this.setState(
            { dragging: false }, 
            ()  => {
                // State changes have finished.
                if (this.props.onDragged) {
                    this.props.onDragged(this.state.x, this.state.y);
                }
            }
        );

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
        return (
            <g
                transform={`translate(${x}, ${y})`}
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
    onDragged: PropTypes.func,
};

class InputConnector extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <g>
                <text
                    x={this.props.x + 12}
                    y={this.props.y + 22}
                    textAnchor="start"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                </text>
                <circle 
                    cx={this.props.x+1}
                    cy={this.props.y + 20}
                    r="6"
                    fill="white"
                    stroke="black"
                    />
            </g>
        );
    }
}

InputConnector.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
};

class OutputConnector extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <g>
                <circle 
                    cx={this.props.x}
                    cy={this.props.y + 20}
                    r="6"
                    fill="white"
                    stroke="black"
                    />
                <text
                    x={this.props.x-12}
                    y={this.props.y + 22}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                </text>
            </g>
        );
    }
}

OutputConnector.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
};

class Node extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const x = this.props.x;
        const y = this.props.y;
        const inputConnectors = this.props.inputConnectors;
        const outputConnectors = this.props.outputConnectors;
        return (
            <Draggable
                x={x}
                y={y}
                onDragged={this.props.onDragged}
                >
                <rect
                    className="node-rect"
                    ry="10"
                    rx="10"
                    x="0"
                    y="0"
                    width={this.props.width}
                    height={this.props.height}
                    fill="white"
                    stroke="black"
                />
                <text
                    x={this.props.width / 2}
                    y={this.props.height / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                </text>

                {inputConnectors.map((inputConnector, index) => <InputConnector x={0} y={10 + (20*index)} name={inputConnector.name} />)}

                {outputConnectors.map((outputConnector, index) => <OutputConnector x={this.props.width} y={10 + (20*index)} name={outputConnector.name} />)}

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
    onDragged: PropTypes.func,
    inputConnectors: PropTypes.array.isRequired,
    outputConnectors: PropTypes.array.isRequired,
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            node: {
                x: 120,
                y: 75,
                inputConnectors: [
                    {
                        name: "Input 1",
                    },
                    {
                        name: "Input 2",
                    },
                    {
                        name: "Input 3",
                    },
                ],
                outputConnectors: [
                    {
                        name: "Output 1",
                    },
                    {
                        name: "Output 2",
                    },
                    {
                        name: "Output 3",
                    },
                ],
            },
        };

        // Interesting pattern for binding your events.
        this.onDragged = this.onDragged.bind(this);
    }

    onDragged (x, y) {
        console.log("onDragged: " + x + ", " + y);

        this.setState(
            {
                node: {
                    ...this.state.node, // Preseve existing nested state using the spread operator. This is a bit wierd.
                    x: x,
                    y: y,
                },
            },
            () => {
                console.log("State updated finished");
                console.log(this.state);
            }
        );
    }

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
                            x={this.state.node.x}
                            y={this.state.node.y}
                            width={300}
                            height={100}
                            name="Test node"
                            onDragged={this.onDragged}
                            inputConnectors={this.state.node.inputConnectors}
                            outputConnectors={this.state.node.outputConnectors}
                        />
                    </svg>
                </div>
            </div>
        );
    }
}

export default App;
