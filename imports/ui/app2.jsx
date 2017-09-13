import React, { Component,PropTypes } from 'react'

export class app2 extends Component {
  render() {
    return (
      <div>
        <p>{this.props.text}</p>
      </div>
    )
  }
}
app2.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  text: PropTypes.string.isRequired,
};
