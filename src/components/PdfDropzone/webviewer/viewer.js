/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import _ from 'lodash';
import Promise from 'bluebird';

const parseName = (user) => {
  const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
  const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));

  return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
};


class SelectSigner extends Component {
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
              console.log('annot', ev.target.value);
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


class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      ...this.props.config,
      path: '/lib',
      custom: JSON.stringify(this.props?.config?.custom),
    }, this.viewerRef.current);


    this.instance = instance;
    window.instance = instance;


    instance.annotationPopup.add({
      type: 'customElement',
      title: 'Select Signer',
      render: () => (
        <SelectSigner
          annotManager={instance.annotManager}
          signers={instance.iframeWindow.getSigners()}
        />
      ),
    });


    instance.docViewer.on('ready', async () => {
      instance.annotManager.off('widgetAdded');
      instance.annotManager.off('annotationAdded');
      instance.annotManager.off('annotationDeleted');
      instance.annotManager.off('annotationUPdated');

      instance.annotManager.on('widgetAdded', (args) => {
        console.log('widget added', args);
      });

      instance.annotManager.on('annotationAdded', (args) => {
        console.log('annotation added', args);

        if (this.props.onAnnotationAdded) {
          return this.props.onAnnotationAdded({
            ...args,
            docId: this.props.selectedDoc,
          });
        }
      });

      instance.annotManager.on('annotationDeleted', (args) => {
        console.log('annotation deleted', args);

        if (this.props.onAnnotationDeleted) {
          return this.props.onAnnotationDeleted({
            ...args,
            docId: this.props.selectedDoc,
          });
        }
      });

      instance.annotManager.on('annotationUpdated', (args) => {
        console.log('annotation updated', args);

        if (this.props.onAnnotationUpdated) {
          return this.props.onAnnotationUpdated({
            ...args,
            docId: this.props.selectedDoc,
          });
        }
      });





      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(
          this.props.docs[this.props.selectedDoc]?.url
          || this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' }
        );
      }


      instance.annotManager.trigger('setSigners', this.props.signers);
      instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner || _.head(this.props.signers).id);

      instance.docViewer.on('annotationsLoaded', async () => {
        console.log('%cannotationsLoaded', 'font-size:20px; color:ref;');

        return this.loadAnnotations();
      });
    });

    instance.docViewer.on('documentLoaded', () => {
      if (_.isFunction(this.props.onReady)) {
        this.props.onReady({
          ...instance,
          setSigner: instance.iframeWindow.setSigner,
        });
      }
    });
  }

  componentDidUpdate = async (prevProps) => {
    // if currently selected signer doesn not equal previously selected, then update wv
    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      await this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    // if selected document changes then load it
    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(
          this.props.docs[this.props.selectedDoc]?.url
          || this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' }
        );
      }
    }


    // if annotations object has changed
    if (prevProps.annotations !== this.props.annotations) {
      await this.loadAnnotations();
    }
  }


  loadAnnotations = async () => {
    const annotations = _.chain(this.props.annotations)
      .toPairs()
      .filter(([, val]) => val.docId === this.props.selectedDoc)
      .value();


    await Promise.map(annotations, ([, value]) => {
      return this.instance.annotManager.trigger('addAnnotation', {
        ...value,
        xfdf: unescape(value.xfdf),
      });
    });
  }

  render() {
    return (
      <>
        <div
          style={{
            height: 800,
            visibility: 'visible',
          }}
          ref={this.viewerRef}
        />
      </>
    );
  }
}

export default Webviewer;
