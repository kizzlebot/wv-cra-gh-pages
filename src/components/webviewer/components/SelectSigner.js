import React, { Component } from 'react'
import _ from 'lodash';
import * as R from 'ramda';

const getTemplateAnnots = R.filter(
  R.pipe(
    R.path(['constructor', 'name']),
    R.includes('Template')
  )
)
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

    const annots = _.filter(selectedAnnots, (a) => {
      return a.constructor.name.includes('Template')
    });

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
    const annots = getTemplateAnnots(selectedAnnots);
    

    const consumer = _.find(this.props.signers, { type: 'consumer' });
    const otherSigners = _.chain(this.props.signers)
      .filter((el) => !_.isEqual(el.type, 'consumer'))
      .sortBy(['lastName', 'firstName'])
      .value();
      
    const notary = {
      id: 'Notary',
      type: 'notary',
    }





    // TODO: set annot.Author and annot.CustomData.type
    if (annots.length === selectedAnnots.length) {
      return (
        <div>
          <label htmlFor='signer'>Signer: </label>
          <select
            value={this.state.signerId || consumer.id}
            onChange={(ev) => {
              _.map(annots, (a) => {
                a.setSigner(ev.target.value);
                this.setState({ signerId: ev.target.value });
              });
            }}
          >
            {
              _.map([notary, consumer, ...otherSigners], (signer) => {
                return (
                  <option key={signer.id} value={signer.id}>
                    {
                      signer.type !== 'notary' ? parseName(signer) : 'Notary'
                    }
                  </option>
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