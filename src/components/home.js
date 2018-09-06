
import React from 'react';

import Signup from './signup';
import Login from './login';

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      signup: false
    }
  }

  toggle() {
    this.setState({
      signup: !this.state.signup
    })
  }

  render() {
    return (
      <div>
        {this.state.signup ? <Signup toggle={() => this.toggle()} />
        : <Login toggle={() => this.toggle()} toDoc={() => this.props.toDoc()} />}
      </div>
    )
  }
}
