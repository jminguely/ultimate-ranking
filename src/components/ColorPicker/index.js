import React, {Component} from 'react';
import { GithubPicker } from 'react-color';
import './style.scss';

class ColorPicker extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      color: props.color
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        color: this.props.color
      });
    }
  }

  render(){
    return (
      <>
        <div className="colorPreview" style={{background: this.state.color, width: '1em', height: '1em', border: '1px solid black'}}>
        <GithubPicker 
          className="colorPicker"
          color={ this.state.color }
          onChange={(e) => this.props.handleChange(e.hex)}/>
          </div>
      </>
    )
  }
}
    
export default ColorPicker;