import React, { Component } from 'react'
import _ from 'lodash';
import Promise from 'bluebird';
import SelectSigner from './components/SelectSigner';
import registerTools from './lib/tools';



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
      this.instance = instance;
      window.instance = instance;

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
        {
          type: 'toolGroupButton',
          toolGroup: 'certTools',
          img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-5x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
          dataElement: 'certToolGroupButton',
          title: 'Certs/Stamps',
          hidden: ['tablet', 'mobile']
        },
      ];
  
  
      
      instance.updateTool('NotaryStampTool', { buttonGroup: 'certTools' });
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
