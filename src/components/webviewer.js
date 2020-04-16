import React, { Component } from 'react'
import _ from 'lodash';



class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
    this.viewerRef = React.createRef();
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({ 
      ...this.props.config 
    }, this.viewerRef.current);

    
    this.instance = instance;
    await this.setState({ instance });
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.selectedDoc !== this.props.selectedDoc){
      if (!_.isEmpty(this.props.selectedDoc)){
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