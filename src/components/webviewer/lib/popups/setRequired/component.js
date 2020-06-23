import React, { Component } from 'react'
import _ from 'lodash';
import * as R from 'ramda';

const getTemplateAnnots = R.filter(
  R.pipe(
    R.path(['constructor', 'name']),
    R.includes('Template')
  )
);

export default class RequiredCheckbox extends Component {
  constructor(...args) {
    super(...args);
    this.state = { checked: false };
  }

  componentDidMount = async () => {
    const selectedAnnots = this.props.annotManager.getSelectedAnnotations();

    const annots = _.filter(selectedAnnots, (a) => a.constructor.name.includes('Template'));

    if (annots.length === selectedAnnots.length) {
      const checked = _.reduce(annots, (acc, annot) => acc && _.get(annot, 'CustomData.flags.required', false), true);
      const indeterminate = _.reduce(annots, (acc, annot) => acc || _.get(annot, 'CustomData.flags.required', false), false);

      await this.setState({ checked, indeterminate });
    }
  }
  handleChange = (annots) => (evt) => {
    _.map(annots, (annot) => annot.setIsRequired(evt.target.checked));
    this.setState({ checked: evt.target.checked });
  }

  render() {
    const selectedAnnots = this.props.annotManager.getSelectedAnnotations();
    const annots = getTemplateAnnots(selectedAnnots);

    // TODO: set annot.Author and annot.CustomData.type
    if (annots.length === selectedAnnots.length) {
      return (
        <div style={{ paddingRight: 5 }}>
          <label className="form-check-label" for="isRequired">Required</label>
          <input 
            type="checkbox" 
            className="form-check-input" 
            id="isRequired" 
            checked={this.state.checked}
            onChange={this.handleChange(annots)}
          />
        </div>
    
      );
    }
    return <></>

  }
}