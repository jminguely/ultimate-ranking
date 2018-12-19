import React, {Component} from 'react';

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      league: props.league,
      widthCharts: 1000,
      heightCharts: 500,
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        league: prevProps.league, 
      });
    }
  }
  
  render(){
    const rightMargin = 200;
    const matchsQty = Object.keys(this.state.league.leagueMatchs).length; 
    console.log('boom');
    return (
      <svg preserveAspectRatio="xMaxYMax meet" width={this.state.widthCharts} height={this.state.heightCharts} viewBox={`0 0 ${this.state.widthCharts} ${this.state.heightCharts}`}>
        <g>
          {Object.keys(this.state.league.leagueMatchs).map((matchKey, matchIndex) => {
            
            return (
              <line key={matchIndex} x1={(this.state.widthCharts-rightMargin) / matchsQty * (matchIndex + 1)} y1={0} x2={(this.state.widthCharts-rightMargin) / matchsQty * (matchIndex + 1)} y2={this.state.heightCharts} strokeWidth={1} stroke="#ddd"/>
            )
          }
          )};
        </g>
        <g>
          {[...Array(9).keys()].map((icon, index) => (
            <line key={index} y1={(this.state.heightCharts) / 10 * (index + 1)} x1={0} y2={(this.state.heightCharts) / 10 * (index + 1)} x2={this.state.widthCharts} strokeWidth={1} stroke={index == 4 ? "#333" : "#ddd"}/>
          )
          )};
        </g>
        {Object.keys(this.state.league.leaguePlayers).map((playerKey, playerIndex) => {
          const player = this.state.league.leaguePlayers[playerKey];
          let lastScore = 1000;
            return (
            <g key={playerIndex}>
            <text 
              x={this.state.widthCharts - rightMargin + 10} 
              y={
                this.state.heightCharts - player.playerScore / 4} 
              fill={player.playerColor} >
                {player.playerName} ({Math.round(player.playerScore)})
            </text>
            <path 
              d={`M 5 250 
                  ${
                    Object.keys(this.state.league.leagueMatchs).map((matchKey, matchIndex) => {
                      const match = this.state.league.leagueMatchs[matchKey];
                      match.matchResults.forEach(rank => {
                        if(rank.playerKey == playerKey) {
                          lastScore = rank.newScore;
                        }
                      });
                        
                      return `L ${(this.state.widthCharts-rightMargin) / matchsQty * (matchIndex + 1 )} ${this.state.heightCharts - lastScore / 4}`
                        
                    })
                    
                  }
                `} 
              stroke={player.playerColor} 
              strokeWidth="5" 
              fill="none" 
              strokeLinecap="round"
            />
            </g>
            )
          }
        )}

      </svg>
    )
  }
}
    
export default BarChart;