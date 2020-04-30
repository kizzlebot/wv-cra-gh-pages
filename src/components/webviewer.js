import React, { Component } from 'react'
import _ from 'lodash';
import Popover from 'react-bootstrap/Popover';
import Overlay from 'react-bootstrap/Overlay';
import Button from 'react-bootstrap/Button';


class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();

    this.togglePlaceholder = this.togglePlaceholder.bind(this);
  }

  togglePlaceholder() {
    this.setState({ showPlaceHolder: !this.state.showPlaceHolder });
  }



  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      ...this.props.config,
      path: '/lib',
      custom: JSON.stringify(this.props?.config?.custom || {})
    }, this.viewerRef.current);


    this.instance = instance;
    const { docViewer, } = instance;
    window.instance = instance;

    console.log('finished init')

    // ref: https://www.pdftron.com/documentation/web/guides/customizing-popup/
    // instance.annotationPopup.add({
    //   type: 'customElement',
    //   title: 'Select Signer',
    //   render: (...args) => {
    //     const annot = _.head(instance.annotManager.getSelectedAnnotations());

    //     // TODO: set annot.Author and annot.CustomData.type

    //     if (annot instanceof instance.Annotations.StampAnnotation) {
    //       return (
    //         <div>
    //           <label htmlFor="signer">Signer: </label>
    //           <select
    //             onChange={() => {
    //               console.log('annot', annot);
    //             }}
    //           >
    //             <option value="1">1</option>
    //             <option value="1">2</option>
    //           </select>
    //         </div>
    //       )
    //     }
    //     return null;

    //   }
    // });

    await this.setState(({ instance }) => {
      if (this.props.onReady) {
        return this.props.onReady(instance);
      }
    });

  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(this.props.selectedDoc, { l: this.props.config.l, extension: 'pdf' });
      }
    }
  }

  render() {
    return (
      <>
        <div
          style={{ height: '100%' }}
          ref={this.viewerRef}
        />
      </>
    );
  }
}

export default Webviewer;
