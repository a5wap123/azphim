import React, { Component, PropTypes } from 'react';
 
// Task component - represents a single todo item
export default class Task extends Component {
    componentWillMount = () => {
      console.log(this.props.isConnected)
    }
    
  render() {
    return (
      <p> Connected: {this.props.isConnected}</p>
    );
  }
}
 
Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  isConnected: PropTypes.string.isRequired,
};