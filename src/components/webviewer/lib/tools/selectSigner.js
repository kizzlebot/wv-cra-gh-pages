import React from 'react'

import * as R from 'ramda';
import _ from 'lodash';
import { setHeaderItems, injectHeaderItem } from "../initializers/injectors";
import parseName from '../helpers/parseName';

// const refreshIcon = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times-square" role="img" viewBox="0 0 448 512" class="svg-inline--fa fa-times-square fa-w-14 fa-5x"><path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-54.4 289.1c4.7 4.7 4.7 12.3 0 17L306 377.6c-4.7 4.7-12.3 4.7-17 0L224 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L102.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L280 256l65.6 65.1z" class=""></path></svg>`;
// const createSelCurrentSignerHeader = (selectedSigner, signers, opt) => {
//   const element = window.document.createElement('select');
//   const defOpt = window.document.createElement('option');

//   defOpt.setAttribute('value', selectedSigner || '-1');
//   defOpt.innerText = '--- select signer ---';
//   element.appendChild(defOpt);
//   _.map(signers, (signer) => {
//     const opt = window.document.createElement('option');

//     opt.setAttribute('value', signer.id);
//     opt.innerText = `${signer.firstName || signer?.user?.firstName} ${signer.lastName || signer?.user?.lastName}`;
//     element.appendChild(opt);

//     return opt;
//   });

//   element.addEventListener('change', (evt) => opt.onChange(evt.target.value));

//   return element;
// };


class SelectSigner extends React.Component {
  state = { 
    signers: [],
    selectedSigner: null
  }
  componentDidMount() {
    const { instance } = this.props;
    this.setState({
      signers: instance.getSigners(),
      selectedSigner: instance.getSigner(),
    })
    instance.annotManager.on('signersChanged', () => {
      this.setState({ signers: instance.getSigners() });
    });
    instance.annotManager.on('selectedSignerChanged', (signer) => {
      this.setState({ selectedSigner: signer });
    });
  }
  
  render() { 
    return (  
      <select
        value={this.state.selectedSigner}
        onChange={(evt) => {
          console.log('setSelectedSigner', evt.target.value)
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
    render: () => <SelectSigner instance={instance} />
  });
}


const registerSelectSigner = R.pipeP(
  injectHeaderItem([
    setCurrentSigner,
  ]),
  setHeaderItems({ insertBefore: 'eraserToolButton' }),
)

export default registerSelectSigner;