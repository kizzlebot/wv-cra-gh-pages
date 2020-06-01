import React, { Component } from 'react'
import _ from 'lodash';
import Promise from 'bluebird';
import SelectSigner from './components/SelectSigner';
import { registerFormFieldTools, registerTools } from './lib/tools';



class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      ...this.props.config,
      path: '/lib',
      // pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);


    this.instance = instance;
    window.instance = instance;
    


    // instance.annotationPopup.add({
    //   type: 'customElement',
    //   title: 'Select Signer',
    //   render: () => (
    //     <SelectSigner
    //       annotManager={instance.annotManager}
    //       signers={instance.iframeWindow.getSigners()}
    //     />
    //   ),
    // });


    // get fired after config.js updates
    instance.docViewer.one('ready', async (instance) => {
      this.setState(({ instance }));


      instance.annotManager.on('widgetAdded', (args) => {
        console.log('widget added', args)
      });

      instance.annotManager.on('annotationAdded', (args) => {
        console.log('annotation added', args)
      });

      instance.annotManager.on('annotationDeleted', (args) => {
        console.log('annotation deleted', args)
      });

      instance.annotManager.on('annotationUpdated', (args) => {
        console.log('annotation updated', args)
      });





      if (!_.isEmpty(this.props.selectedDoc)) {
        console.log('loading document')
        await this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }


      console.log('this.props.signers', this.props.signers)
      instance.annotManager.trigger('setSigners', this.props.signers)
      instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

      instance.docViewer.on('annotationsLoaded', async () => {
        console.log('%cannotationsLoaded', 'font-size:20px; color:ref;')
        return this.loadAnnotations()
      });


      const { headers: { formFieldTools, templateTools } } = await registerTools(instance);

      const notaryBtns = [
        {
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
          title: 'Form Field Tools',
          dataElement: 'formFieldTools',
          onClick: () => instance.setActiveHeaderGroup('formFieldGroup')
        },
        {
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
          title: 'Template Tools',
          dataElement: 'templateTools',
          onClick: () => instance.setActiveHeaderGroup('templateToolsGroup')
        },
      ];
  
  
      instance.registerHeaderGroup('formFieldGroup', [
        { type: 'spacer' },
        { type: 'divider' },
        ...formFieldTools,
      ]);
  
      instance.registerHeaderGroup('templateToolsGroup', [
        { type: 'spacer' },
        { type: 'divider' },
        ...templateTools,
      ]);
  
  
      instance.setHeaderItems((header) => {
        _.map(notaryBtns, (item) => {
          header.get('eraserToolButton').insertBefore(item);
        });
      });
  



      if (_.isFunction(this.props.onReady)) {
        this.props.onReady({
          ...instance,
        });
      }
    });
  }

  componentDidUpdate = async (prevProps, prevState) => {

    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      await this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        return this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }
    }


    if (prevProps.annotations !== this.props.annotations) {
      await this.loadAnnotations();
    }
  }


  loadAnnotations = async () => {
    const annotations = _.chain(this.props.annotations)
      .toPairs()
      .filter(([key, val]) => val.docId === this.props.selectedDoc)
      .value();


    await Promise.map(annotations, ([key, value]) => {
      return this.instance.annotManager.trigger('addAnnotation', {
        ...value,
        xfdf: unescape(value.xfdf)
      })
    });

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
