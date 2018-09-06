import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

export default class FontSizeSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DropdownButton title="Font Size" id="bg-nested-dropdown" onSelect={eventKey => this.props.edit(eventKey)}>
        <MenuItem eventKey="8">8</MenuItem>
        <MenuItem eventKey="9">9</MenuItem>
        <MenuItem eventKey="10">10</MenuItem>
        <MenuItem eventKey="12">12</MenuItem>
        <MenuItem eventKey="14">14</MenuItem>
        <MenuItem eventKey="16">18</MenuItem>
        <MenuItem eventKey="20">20</MenuItem>
        <MenuItem eventKey="24">24</MenuItem>
        <MenuItem eventKey="28">28</MenuItem>
        <MenuItem eventKey="32">32</MenuItem>
        <MenuItem eventKey="36">36</MenuItem>
        <MenuItem eventKey="40">40</MenuItem>
        <MenuItem eventKey="48">48</MenuItem>
        <MenuItem eventKey="60">60</MenuItem>
      </DropdownButton>);
  }
}
