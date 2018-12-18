import React, {Component} from 'react';
import icons from '../../constants/icons.json';
import './style.scss';

class CharacterPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      character: props.character
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ 
        character: this.props.character
      });
    }
  }

  render(){
    return (
      <select 
        value={this.props.character}
        onChange={(e) => this.props.handleChange(e.target.value)}>
          <option value=""></option>
          {icons.map(icon =>
            <option key={icon.value} value={icon.value}>{icon.label}</option>
          )};
      </select>
    )
  }
}
    
export default CharacterPicker;