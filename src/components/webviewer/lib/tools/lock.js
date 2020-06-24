import React from 'react'

import * as R from 'ramda';
import _ from 'lodash';
import { injectTool } from "../initializers/injectors";
import parseName from '../helpers/parseName';



class LockButton extends React.Component {
  constructor(props, ctx){
    super(props, ctx)

    this.state = { locked: false }
  }

  componentDidMount() {
    const { instance } = this.props;
    this.setState({ locked: instance.getLock(), })

    
    instance.docViewer.on('lockChanged', (locked) => this.setState({ locked }));
  }
  
  render() { 
    return (  
      <div>
        <label>Lock</label>
        <input 
          type='checkbox' 
          checked={this.state.locked}
          onChange={(evt) => this.props.instance.docViewer.trigger('setLockStatus', [evt.target.checked])}
        />
      </div>
    );
  }
}


const showLockButton = ({ instance }) => {
  return ({
    type: 'customElement',
    title: 'Lock Checkbox',
    dataElement: 'lockCheckbox',
    render: () => <LockButton instance={instance}  />
  });
};

const registerShowSigner = R.pipeP(
  injectTool('LockCheckbox', showLockButton)
);

export default registerShowSigner;