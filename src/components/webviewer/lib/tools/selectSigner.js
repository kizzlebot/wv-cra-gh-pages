import React from 'react'

import * as R from 'ramda';
import _ from 'lodash';
import { injectTool } from "../initializers/injectors";
import parseName from '../helpers/parseName';




class SelectSigner extends React.Component {
  constructor(props, ctx){
    super(props, ctx)

    this.state = { 
      signers: props.signers,
      selectedSigner: null
    }
  }

  componentDidMount() {
    const { instance } = this.props;
    this.setState({
      signers: instance.getSigners(),
      selectedSigner: instance.getSelectedSigner(),
    })
    instance.annotManager.on('signersChanged', (...args) => this.setState({ signers: instance.getSigners() }));
    instance.annotManager.on('selectedSignerChanged', (signer) => this.setState({ selectedSigner: signer }));
  }
  
  render() { 
    return (  
      <select
        value={this.state.selectedSigner}
        onChange={(evt) => {
          this.props.instance.annotManager.trigger('setSelectedSigner', evt.target.value)
        }}
      >
        {
          _.map(this.state.signers, (signer) => (
            <option key={signer.id} value={signer.id}>{parseName(signer)}</option>
          ))
        }
      </select>

    );
  }
}


const setCurrentSigner = ({ instance }) => {
  return ({
    type: 'customElement',
    title: 'Select Signer',
    dataElement: 'selectSigner',
    render: () => <SelectSigner signers={instance.getSigners()} instance={instance} />
  });
}


const registerSelectSigner = R.pipeP(injectTool('SelectSigner', setCurrentSigner))

export default registerSelectSigner;