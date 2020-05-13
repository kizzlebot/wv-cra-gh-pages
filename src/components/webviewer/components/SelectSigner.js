import React, { Component } from 'react'
import _ from 'lodash';


const parseName = (user) => {
  const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
  const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));

  return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
};


export default class SelectSigner extends Component {
  constructor(...args) {
    super(...args);
    this.state = { signerId: null };
  }

  componentDidMount = async () => {
    const selectedAnnots = this.props.annotManager.getSelectedAnnotations();
    const annots = _.filter(selectedAnnots, (a) => a.constructor.name === 'TemplateFreeText');

    if (annots) {
      const signerId = _.chain(annots)
        .head()
        .get('CustomData.signerId')
        .value();

      await this.setState({ signerId });
    }
  }

  render() {
    const selectedAnnots = this.props.annotManager.getSelectedAnnotations();
    const annots = _.filter(selectedAnnots, (a) => a.constructor.name === 'TemplateFreeText');

    const consumer = _.find(this.props.signers, { type: 'consumer' });
    const otherSigners = _.chain(this.props.signers)
      .filter((el) => !_.isEqual(el.type, 'consumer'))
      .sortBy(['lastName', 'firstName'])
      .value();





    // TODO: set annot.Author and annot.CustomData.type
    if (annots.length === selectedAnnots.length) {
      return (
        <div>
          <label htmlFor='signer'>Signer: </label>
          <select
            value={this.state.signerId || consumer.id}
            onChange={(ev) => {
              // annot.setContents()
              _.map(annots, (a) => {
                a.setSigner(ev.target.value);
                this.setState({ signerId: ev.target.value });
              });
            }}
          >
            {
              _.map([consumer, ...otherSigners], (signer) => {
                return (
                  <option key={signer.id} value={signer.id}>{parseName(signer)}</option>
                );
              })
            }
          </select>
        </div>
      );
    }

    return null;
  }
}