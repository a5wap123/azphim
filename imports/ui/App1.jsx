import React, { Component, PropTypes } from 'react'

export default class App1 extends Component {
  componentDidMount(){
    console.log('abc')
  }
  render() {
    return (
        <button onClick={()=>this.props.click('app1')} >text callback</button>
    )
  }
}

App1.propTypes= {
  click: PropTypes.func.isRequired
}