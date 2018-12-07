import React, {Component} from 'react';
import * as d3 from "d3";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      width: 900,
      height: 300,
      matchs: props.matchs,
      players: props.players,
    };

    console.log(props.players, props.matchs);

    this.drawChart();

  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        players: prevProps.players, 
        matchs: prevProps.matchs
      });
      this.drawChart();
    }
  }

  drawChart() {

    if(Object.keys(this.state.players).length > 0) {
      var margin = {top: 20, right: 100, bottom: 30, left: 10},
      width = 960 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

      var x = d3.scale.linear()
      .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(function(d) {
          if (d % 1 === 0) {
            return d3.format('.f')(d)
          } else {
            return ""
          }
        });


      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('right').tickFormat(d => {
            if (d % 1 === 0) {
              // return this.state.players[this.state.finalRank[d-1]].data.playerName;
            } else {
              return ""
            }
          });


      var line = d3.svg.line()
          .interpolate('monotone')
          .x(function(d, i) { return x(i+1); })
          .y(function(d) { return y(d); });


      d3.select(`#${this.props.id}`).selectAll("svg").remove();

      var svg = d3.select(`#${this.props.id}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 960 300")
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      
      var teamNames = Object.keys(this.state.players);

      // Lets do some magic
      
      // var teamData = teamNames.map((t, i) => { 
      //   return { name: t, values: this.state.data[t], index: i };
      // });
      // x.domain(d3.extent(d3.range(1, teamData[0].values.length + 1)));
      // y.domain([teamNames.length + 0.5, 1]);

      svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

      svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + width + ', 0)')
          .call(yAxis.outerTickSize(0)
            .innerTickSize(0))

      // svg.append('g').selectAll('.line')
      //     .data(teamData)
      //     .enter()
      //     .append('path')
      //     .attr('class', 'line')
      //     .attr('d', function(d) { return line(d.values); })
      //     .style({
      //       stroke: (d, i) => { 
      //         return this.state.colors[d.name];
      //       },
      //       fill: 'transparent',
      //       'stroke-width': 2
      //     })
         
    }
  }
        
  render(){
    return <div id={this.props.id}></div>
  }
}
    
export default BarChart;