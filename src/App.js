import React, { Component } from 'react';
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
                x: e.pageX - this.props.x,
                y: e.pageY - this.props.y
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

       const x = e.pageX - this.state.rel.x;
       const y = e.pageY - this.state.rel.y;

       if (this.props.onDragged) {
            this.props.onDragged(this.props.id, x, y);
       }


        e.stopPropagation();
        e.preventDefault();
    }
    
    render () {
        return (
            <g
                transform={`translate(${this.props.x}, ${this.props.y})`}
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
        const textPaddingLeft = 10;
        const textPaddingTop = 1;
        return (
            <g>
                <text
                    x={this.props.x+textPaddingLeft}
                    y={this.props.y+textPaddingTop}
                    textAnchor="start"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                    {Math.random().toFixed(2)}
                </text>
                <circle 
                    cx={this.props.x}
                    cy={this.props.y}
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
        const textPaddingRight = 10;
        const textPaddingTop = 1;
        return (
            <g>
                <circle 
                    cx={this.props.x}
                    cy={this.props.y}
                    r="6"
                    fill="white"
                    stroke="black"
                    />
                <text
                    x={this.props.x-textPaddingRight}
                    y={this.props.y+textPaddingTop}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    >
                    {this.props.name}
                    {Math.random().toFixed(2)}
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
                    {Math.random().toFixed(2)}
                </text>

                {this.props.inputConnectors.map((inputConnector, index) => 
                    <InputConnector 
                        key={index}
                        x={0} 
                        y={this.props.connectorPaddingTop + (this.props.connectorSpacing*index)} 
                        name={inputConnector.name} 
                        />
                )}

                {this.props.outputConnectors.map((outputConnector, index) => 
                    <OutputConnector 
                        key={index}
                        x={this.props.width} 
                        y={this.props.connectorPaddingTop + (this.props.connectorSpacing*index)} 
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
    connectorPaddingTop: PropTypes.number.isRequired,
    connectorSpacing: PropTypes.number.isRequired,
};

class FlowchartEditor extends Component {

    constructor(props) {
        super(props);

        this.connectorPaddingTop = 25;
        this.connectorSpacing = 21;

        this.state = {
            flowchart: this.props.flowchart,
        };

        this.nodesMap = {};
        this.sourceConnectorsMap = {};
        this.destConnectorsMap = {};
        this.state.flowchart.nodes.forEach(node => {
            this.nodesMap[node.name] = node;
            node.inputConnectors.forEach((inputConnector, index) => {
                this.destConnectorsMap[node.name + "/" + inputConnector.name] = {
                    node: node,
                    connector: inputConnector,
                    index: index,
                };
            })

            node.outputConnectors.forEach((outputConnector, index) => {
                this.sourceConnectorsMap[node.name + "/" + outputConnector.name] = {
                    node: node,
                    connector: outputConnector,
                    index: index,
                };
            })
        });

        // Interesting pattern for binding your events.
        this.onDragged = this.onDragged.bind(this);
    }
    
    onDragged (id , x, y) {
        console.log("onDragged: " + id + " -- " + x + ", " + y);

        const newState = Object.assign({}, this.state);
        const draggedNode = newState.flowchart.nodes[id];
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

    //
    // Compute an SVG path for a connector between two nodes.
    //
    computeConnectionPath(connection) {

        const sourceNode = this.sourceConnectorsMap[connection.source].node;
        const sourceConnectorIndex = this.sourceConnectorsMap[connection.source].index;
        const destNode = this.destConnectorsMap[connection.dest].node;
        const destConnectorIndex = this.destConnectorsMap[connection.dest].index;

        const pt1 = {
            x: sourceNode.x + sourceNode.width,
            y: sourceNode.y + this.connectorPaddingTop + (sourceConnectorIndex * this.connectorSpacing),
        };
        
        const pt2 = {
            x: destNode.x,
            y: destNode.y + this.connectorPaddingTop + (destConnectorIndex * this.connectorSpacing),
        };

        return "M " + pt1.x + " " + pt1.y + 
            " C " + (pt1.x + (pt2.x - pt1.x) / 2) + " " + pt1.y + ", " + 
                (pt2.x - (pt2.x - pt1.x) / 2) + " " + pt2.y + ", " + 
                pt2.x + " " + pt2.y;
    }

    render() {                
        return ( // I like this pattern of using JS map function. It seems simpler than having a foreach stmt in the template language.
            <div 
                style={{display: "flex", flexDirection: "column", flexGrow: 1}}
                >
                <div
                    style={{display: "flex", flexDirection: "row"}}
                    >
                    <button
                        ng-click="addNewNode()"
                        title="Add a new node to the chart"
                        >
                        Add Node
                    </button>
                    <button
                        ng-click="addNewInputConnector()"
                        ng-disabled="chartViewModel.getSelectedNodes().length == 0"
                        title="Add a new input connector to the selected node"
                        >
                        Add Input Connector
                    </button>
                    <button
                        ng-click="addNewOutputConnector()"
                        ng-disabled="chartViewModel.getSelectedNodes().length == 0"
                        title="Add a new output connector to the selected node"
                        >
                        Add Output Connector
                    </button>
                    <button
                        ng-click="deleteSelected()"
                        ng-disabled="chartViewModel.getSelectedNodes().length == 0 && chartViewModel.getSelectedConnections().length == 0"
                        title="Delete selected nodes and connections"
                        >
                        Delete Selected
                    </button>
                </div>
                <svg style={{display: "flex", flexGrow: 1}}>
                    
                    {this.state.flowchart.nodes.map((node, index) => 
                        <Node
                            key={index}
                            id={index}
                            x={node.x}
                            y={node.y}
                            width={node.width}
                            height={node.height}
                            name={node.name}
                            onDragged={this.onDragged}
                            inputConnectors={node.inputConnectors}
                            outputConnectors={node.outputConnectors}
                            connectorPaddingTop={this.connectorPaddingTop}
                            connectorSpacing={this.connectorSpacing}
                    
                        />
                    )}

                    {this.state.flowchart.connections.map((connection, index) =>
                        <g
                            key={index}
                            >
                            <path 
                                d={this.computeConnectionPath(connection)}
                                stroke="black"
                                fill="transparent"
                                />
                        </g>
                    )}

                </svg>
            </div>
        );
    }
}

FlowchartEditor.propTypes = {
    flowchart: PropTypes.object.isRequired,
    onUpdated: PropTypes.func,
};

class App extends Component {

    constructor (props) {
        super(props);

        this.state = {
            flowchart: {
                nodes: [
                    {
                        name: "Node 1",
                        x: 120,
                        y: 75,
                        width: 300,
                        height: 100,
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
                        width: 300,
                        height: 100,
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
                connections: [
                    {
                        source: "Node 1/Output 1",
                        dest: "Node 2/Input 1",
                    },
                    {
                        source: "Node 1/Output 2",
                        dest: "Node 2/Input 2",
                    },
                ],
            },
        };

        this.onUpdated = this.onUpdated.bind(this);
    }

    onUpdated () {
        console.log("Flowchart updated.");
    }

    render () {
        return (
            <div style={{display: "flex", flexDirection: "row", height: "100vh"}}>
                <div style={{display: "flex", flexDirection: "column", width: "600px"}}>
                    <h1>JSON flowchart</h1>
                    <textarea 
                        style={{display: "flex", flexGrow: 1}}
                        value={JSON.stringify(this.state.flowchart, null, 4)}
                        >
                        
                    </textarea>
                </div>      
                <div 
                    style={{
                        display: "flex", 
                        flexDirection: "column", 
                        flexGrow: 1
                    }}
                    >
                    <h1>Flowchart Editor</h1>
                    <FlowchartEditor 
                        flowchart={this.state.flowchart}
                        onUpdated={this.onUpdated}
                        />  
                </div>
            </div>
        );
    }
}

export default App;
