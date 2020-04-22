import React, { Component } from 'react'
import _ from 'lodash';



class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.viewerRef = React.createRef();
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      ...this.props.config,
      path: '/lib'
    }, this.viewerRef.current);


    this.instance = instance;
    const { docViewer, } = instance;
    window.instance = instance;
    await this.setState({ instance });




    // instance.annotationPopup.add( {
    //   type: 'statefulButton',
    //   initialState: 'Page',
    //   states: {
    //     Page: {
    //       // Checkout https://www.pdftron.com/api/web/WebViewerInstance.html to see more APIs related with viewerInstance
    //       getContent: instance.getCurrentPageNumber,
    //       onClick: () => {
    //         const currentPage = instance.getCurrentPageNumber();
    //         const totalPages = instance.getPageCount();
    //         const atLastPage = currentPage === totalPages;

    //         if (atLastPage) {
    //           instance.goToFirstPage();
    //         } else {
    //           instance.goToNextPage();
    //         }
    //       }
    //     }
    //   },
    //   mount: update => {
    //     // Checkout https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html to see more APIs and events with docViewer
    //     // We want to update this button when page number changes so it can have the correct content;
    //     instance.docViewer.on('pageNumberUpdated.nextPageButton', update);
    //   },
    //   unmount: () => {
    //     instance.docViewer.off('pageNumberUpdated.nextPageButton')
    //   },
    //   dataElement: 'nextPageButton'
    // });

    instance.annotationPopup.add({
      type: 'customElement',
      title: 'Select Signer',
      render: (...args) => {
        console.log('args', args);
        console.log('selected');
        const annot = _.head(instance.annotManager.getSelectedAnnotations());

        return (
          <div>
            <label htmlFor="signer">Signer: </label>
            <select
              onChange={() => {
                console.log('annot', annot);
              }}
            >
              <option value="1">1</option>
              <option value="1">2</option>
            </select>
          </div>
        )
      }
    })

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