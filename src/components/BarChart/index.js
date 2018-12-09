import React, {Component} from 'react';

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaderBoard: props.leaderBoard,
      players: props.players,
      matchs: props.matchs,
      widthCharts: 1000,
      heightCharts: 500,
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        players: prevProps.players, 
        matchs: prevProps.matchs,
        leaderBoard: prevProps.leaderBoard
      });
    }
  }
  
  render(){
    return (
      <svg preserveAspectRatio="xMaxYMax meet" width={this.state.widthCharts} height={this.state.heightCharts} viewBox={`0 0 ${this.state.widthCharts} ${this.state.heightCharts}`}>
        <g>
          {this.state.matchs.map((icon, index) => (
            <line x1={(this.state.widthCharts-150) / this.state.matchs.length * (index + 1)} y1={0} x2={(this.state.widthCharts-150) / this.state.matchs.length * (index + 1)} y2={this.state.heightCharts} strokeWidth={1} stroke="#ddd"/>
          )
          )};
        </g>
        <g>
          {[...Array(9).keys()].map((icon, index) => (
            <line y1={(this.state.heightCharts) / 10 * (index + 1)} x1={0} y2={(this.state.heightCharts) / 10 * (index + 1)} x2={this.state.widthCharts} strokeWidth={1} stroke={index == 4 ? "#333" : "#ddd"}/>
          )
          )};
        </g>
        {Object.keys(this.state.leaderBoard).map((playerKey, playerIndex) => (
          <g>
          <text 
            x={this.state.widthCharts-100} 
            y={
              this.state.heightCharts - this.state.leaderBoard[playerKey][this.state.leaderBoard[playerKey].length-1] / 4} 
            fill={this.state.players[playerKey].playerColor} >
              {this.state.players[playerKey].playerName} ({Math.round(this.state.players[playerKey].playerScore)})
          </text>
          <path 
            d={`M 5 250 
              ${
                this.state.leaderBoard[playerKey].map((score, matchIndex) => (
                  `L ${(this.state.widthCharts-150) / this.state.matchs.length * (matchIndex + 1 )} ${this.state.heightCharts - score / 4}`
                ))
                }
                
              `} 
            stroke={this.state.players[playerKey].playerColor} 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
          />
          </g>

        ))}

      </svg>
    )
  }
}
    
export default BarChart;