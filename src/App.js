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
            rel: null // The position relative to the cursor
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
                    this.props.onDragged(this.props.id, this.state.x, this.state.y);
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
        return (
            <g
                transform={`translate(${this.state.x}, ${this.state.y})`}
                onMouseDown={this.onMouseDown}
                >
                {this.props.children}
            </g>
        );
    }
}

Draggable.propTypes = {
    id: PropTypes.number.isRequired,
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
        return (
            <Draggable
                id={this.props.id}
                x={this.props.x}
                y={this.props.y}
                onDragged={this.props.onDragged}
                >
                <rect
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

                {this.props.inputConnectors.map((inputConnector, index) => 
                    <InputConnector 
                        key={index}
                        x={0} 
                        y={10 + (20*index)} 
                        name={inputConnector.name} 
                        />
                )}

                {this.props.outputConnectors.map((outputConnector, index) => 
                    <OutputConnector 
                        key={index}
                        x={this.props.width} 
                        y={10 + (20*index)} 
                        name={outputConnector.name} 
                        />
                )}

            </Draggable>
        );
    }
}

Node.propTypes = {
    id: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    onDragged: PropTypes.func,
    inputConnectors: PropTypes.array.isRequired,
    outputConnectors: PropTypes.array.isRequired,
};

class FlowchartEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            nodes: this.props.nodes,
        };

        // Interesting pattern for binding your events.
        this.onDragged = this.onDragged.bind(this);
    }
    
    onDragged (id , x, y) {
        console.log("onDragged: " + id + " -- " + x + ", " + y);

        const newState = Object.assign({}, this.state);
        const draggedNode = newState.nodes[id];
        draggedNode.x = x;
        draggedNode.y = y;
        this.setState(newState,
            () => {
                console.log("State updated finished");
                console.log(this.state);

                this.props.onUpdated();
            }
        );
    }

    computeConnectionPath(pt1, pt2) {
        return "M " + pt1.x + " " + pt1.y + 
        " C " + (pt1.x + (pt2.x - pt1.x) / 2) + " " + pt1.y + ", " + 
                (pt2.x - (pt2.x - pt1.x) / 2) + " " + pt2.y + ", " + 
                pt2.x + " " + pt2.y;
    }

    render() {
        const p1 = {
            x: 120 + 300,
            y: 75 + 10 + 20
        };
        const p2 = {
            x: 620,
            y: 150 + 10 + 20,
        };
                
        return ( // I like this pattern of using JS map function. It seems simpler than having a foreach stmt in the template language.
            <svg
                width={this.props.width}
                height={this.props.height}
                >
                
                {this.state.nodes.map((node, index) => 
                    <Node
                        key={index}
                        id={index}
                        x={node.x}
                        y={node.y}
                        width={300}
                        height={100}
                        name={node.name}
                        onDragged={this.onDragged}
                        inputConnectors={node.inputConnectors}
                        outputConnectors={node.outputConnectors}
                    />
                )}

                <g>
                    <path 
                        d={this.computeConnectionPath(p1, p2)}
                        stroke="black"
                        fill="transparent"
                        />
                </g>
            </svg>
        );
    }
}

FlowchartEditor.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    nodes: PropTypes.array.isRequired,
    onUpdated: PropTypes.func,
};

class App extends Component {

    constructor (props) {
        super(props);

        this.state = {
            nodes: [
                {
                    name: "Node 1",
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
                {
                    name: "Node 2",
                    x: 620,
                    y: 150,
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
            ],
        };

        this.onUpdated = this.onUpdated.bind(this);
    }

    onUpdated () {
        console.log("Flowchart updated.");
    }

    render () {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <div>
                    <FlowchartEditor 
                        width={window.innerWidth}
                        height={window.innerHeight}
                        nodes={this.state.nodes}
                        onUpdated={this.onUpdated}
                        />
                </div>
            </div>
        );
    }
}

export default App;
