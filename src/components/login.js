import React from 'react';
import { InputGroup, FormGroup, ButtonGroup, Form, Jumbotron, Glyphicon, FormControl, Button, Row, Col } from 'react-bootstrap';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      typedUsername: "",
      typedPassword: ""
    }
  }

  componentDidMount() {
    // localStorage.removeItem('user');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("USER IS: ", user);
    if (user) {
      this.props.toDoc();
    }
  }

  handleUsername(e) {
    this.setState({
      typedUsername: e.target.value,
    })
    styles.username = {borderWidth: '3px'}
  }

  handlePassword(e) {
    this.setState({
      typedPassword: e.target.value,
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.typedUsername,
        password: this.state.typedPassword
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        console.log('Successfully logged in');
        console.log(responseJson)
        var user = JSON.stringify({
          username: this.state.typedUsername,
          password: this.state.typedPassword,
          id: responseJson.user._id,
        })
        localStorage.setItem('user', user);
        this.props.toDoc();
      } else {
        console.log('No username!');
      }
    })
    .catch((err) => {
      alert("Incorrect username or password. Please register")
      console.log('Error: ', err);
    });

  }



  render() {
    return (
      <Jumbotron style={styles.jumbotron}>
        <h1 style={{textAlign: 'center'}}>Welcome to Collaborative Editor</h1>
        <h3 style={{textAlign: 'center'}}>Log In</h3>
        <Form horizontal onSubmit={(e) => this.handleSubmit(e)}>
          <FormGroup>
            <Col>
              Username
            </Col>
            <Col>
              <FormControl type="username" placeholder="Username" onChange={(e) => this.handleUsername(e)}/>
            </Col>
          </FormGroup>

          <FormGroup>
            <Col>
              Password
            </Col>
            <Col>
              <FormControl type="password" placeholder="Password" onChange={(e) => this.handlePassword(e)}/>
            </Col>
          </FormGroup>

          <FormGroup>
            <Col>
              <ButtonGroup>
                <Button  bsStyle="primary" type="submit" onClick={() => this.props.toggle()}>Go To Register</Button>
                <Button  bsStyle="success" type="submit">Log In</Button>
              </ButtonGroup>
            </Col>
          </FormGroup>

        </Form>
      </Jumbotron>
    )
  }
}

const styles = {
  jumbotron: {
    borderRadius: 3,
    padding: '20px'
  }
}
