import React from 'react'

import * as R from 'ramda';
import _ from 'lodash';
import { injectTool } from "../initializers/injectors";
import parseName from '../helpers/parseName';



class ShowSigner extends React.Component {
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
    const signer = _.find(this.state.signers, { id: this.state.selectedSigner });
    if (!signer){
      return <div>Current Signer: N/A</div>
    }
    return (  
      <div>{parseName(signer)}</div>
    );
  }
}


const showCurrentSigner = ({ instance }) => {
  return ({
    type: 'customElement',
    title: 'Current Signer',
    dataElement: 'showSigner',
    render: () => <ShowSigner signers={instance.getSigners()} instance={instance}  />
  });
};

const registerShowSigner = R.pipeP(
  injectTool('ShowSigner', showCurrentSigner)
);

export default registerShowSigner;