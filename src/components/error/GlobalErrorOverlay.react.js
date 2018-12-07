import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'ramda';
import './GlobalErrorOverlay.css';

export default class GlobalErrorOverlay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { resolve, visible, error } = this.props;
    return (
      <div>
        <div>{this.props.children}</div>
        <div className="dash-error-menu">
          {isEmpty(error.backEnd) ? null : (
            <button onClick={() => resolve('backEnd')}>
              Resolve BackEnd Error
            </button>
          )}
          <div className={visible ? 'dash-fe-errors' : ''}>
            {error.frontEnd.map((e) => (<div className='dash-fe-error'>
              <h3>{e.error.name || 'Unnamed Error'}</h3>
              <p>{e.error.message || 'An error was thrown that was not an Error object, so info could not be gathered.'}</p>
              <button onClick={() => resolve('frontEnd', e.myUID)}>
                Resolve Error
              </button>
              {e.error.stack && e.error.stack.split('\n').map((line) => (<p>{line}</p>))}
            </div>))}
          </div>
        </div>
      </div>
    )
  }
}

GlobalErrorOverlay.propTypes = {
    children: PropTypes.object,
    resolve: PropTypes.func,
    visible: PropTypes.bool,
    error: PropTypes.object
}
