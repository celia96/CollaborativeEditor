import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

export default class FontColourSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DropdownButton title="Font Colour" id="bg-nested-dropdown" onSelect={eventKey => this.props.edit(eventKey)}>
        <MenuItem eventKey="red">Red</MenuItem>
        <MenuItem eventKey="blue">Blue</MenuItem>
        <MenuItem eventKey="green">Green</MenuItem>
        <MenuItem eventKey="yellow">Yellow</MenuItem>
        <MenuItem eventKey="purple">Purple</MenuItem>
        <MenuItem eventKey="black">Black</MenuItem>
        <MenuItem eventKey="gray">Gray</MenuItem>
      </DropdownButton>);

  }
}
