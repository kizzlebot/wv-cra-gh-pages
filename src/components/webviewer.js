import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import _ from 'lodash';
import Popover from 'react-bootstrap/Popover';
import Overlay from 'react-bootstrap/Overlay';
import Button from 'react-bootstrap/Button';

const initialState = {
  instance: null,
  annotation: null,
  docViewer: null,
  stampTool: null,
  annotManager: null,
  showPlaceholder: false,
};

const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case 'toggle_open': {
      return {
        ...state,
        showPlaceholder: !state.showPlaceholder
      };
    }
    case 'set_instance': {
      return {
        ...state,
        ...action.payload
      };
    }
    case 'set_annotation': {
      return {
        ...state,
        annotation: action.payload.annotation
      };
    }
    
    case 'clear_instance': {
      return initialState;
    }

    default:
      return state;
  }
};

const placeHoldersSigner = [
  { 
    stamp: 'Signature',
    src: 'data:image/png;base64,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'
  }
];

const placeHoldersNotary = [
  {
    stamp: 'Seal',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAxCAYAAACmjpVRAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAIuklEQVRoge2be2xT1x3HP8f32o4dx87TkDXQkKxUha0UCm22FVqSUIJQAZVJ27RQ/mDV2CS0aR0d09Z16iT6GpsQU8WqUVWgLezVNn1paZONR+mAtTRAeQi0FJE0gdAE553c+N6zP67j2IkTh1wnbjK+0vnDvuf1+57f73d+5yWIAV9x9X3ARqAI8IdSTMiRPowVQlitYbLQDLIRxFFgT3tNyQdDM0RJ4iupyUe1V9hn5BbZs3IQzhRsDkf8ZiwzOjVgaBpGbzfB6y30X208IIP9G9prShsGvofJ9BbX3KNmZb/rKrzdK1R7cnqbLIzDOmSwn57/ng8EW66tbK8pPQ4hMn0lNflKRvZJ19x5XiFssYrG680NdyaRxa1CyPGZliElPRfPtAdbP1vQXlN6SQVAtVe4Cud6BYA0YhSbYDKT7ibG1wEb4J4z19vR0VYBfEX4iqvvs+fOOuyclR+mJOmyTTqsKUNfwydoTfVLVWCjmpExgkb+v8AamaovE62pfqMKFAm7E8bpNxLRmaRDWLNF4XQAFKmAX6h2kNKCeVvrTLLdikUusSkqSOFXAT+Gwegija55Vobh84AE9d5vzuZhfznSFDTRZCXbTSRGvggyBYgQqXKyhUu2ZieQTClBEjmb32DlyebicwJTMw3DXFINkHKTnHEh2szDuKmZ40HIzCUgb5JiEaoE66ufEQbB6xJsLnbx4JdTmJNjQ1GgtdOg9lKQPYd6OXJBs9buGNH0O3M79nR9kAefbZ2QNoQI+0xpWnkCNdPvtVH5WAa3ZitR/8/0KZQtUChb4OTp1zvZVdWduEZHgAyt7gSGKesQiASFZoNmLhkx3Ivf1PAcT6xLDRN58JzGax/00NkHC2+1891iN4oC2x7yUFXby4Urk7gvEENhpNUlUAjRQft464zBdumdKQA0BXS+tasl/P9bJ6BXM/jRag9CwMoFTi40dY6z4XFA6jH+TKBmWtvkIGaQ7whZd6ZHYVG+yom6YPjbywc7+bTVFOrcp9qw9suXprLxfjdfnKHSG4QP6zR2/aODYxejfezMdBvb1vpYNs9BjseGpsOla0H+erSb3dVdsZXDqqyjYDDOHA3jGLjjFzXun+/EqcKbj+dwok7jnVM9HDrXR+0ljYr3OgYzR8j3m40ZfPNrqeHfTjsUz3eyfJ6DLS9d55Vjpo9Ncwle35pDXtagT3YpcMctdn6x3kdmqo3tr7RFd8qQsWVN0ILPBgM+c+QkjXiJYempv1+nRxtkaVGBg23rfLz9Uz+1z+XykzU+UlQzryHNVLYgJUzksYt9bHmphcf2tnKmQUMIwbPlGWSmCQwJm5Z7wkTuP9LFd3Z/xvOVg+StW+IO1zuMzyEpjvhjSpAoM48xsmfr+1n7zBW2l2exuCD6hNPvU/jB6jRWLXKxevsVOnpMbSlfZhLZ1iP5+q+v0h9yb++c7Ob0jjxSnYKHl7h5sbqD/e93crZeY3aOyovVppa/CTx8r5vCmXb86bbYIV/MMDChPjPebBqvsdiDcfqyxkPbm7j9FpUVd6ayfL6Txbe5wv50bq7KE+t9PL7PnKAW5Juk+1yC+t/Pjlnn3QUOkAaNLQaNLf3keFXWLE7h7gIny+a5KJxpnqw6FBFDLjnxZEpDIqMCzSGVi9HJFiPsMmV6BL0anK/v53x9gF1vgdsh+F6Zj63r0gEoW+hm616TzHR3rJPRaMzIUJES0t2CnZuyWXmXGyEEui75uF7jeqdOhsccraEGZ8gRjDBBk9KgZo42OHHbii787WUennvEj6LA86+1sqMyEP7W3Qc7KltZ/1UPBX6VLI8SDlc6ew18qQqNrTrb9jXHbKmtxwCp80y5n7KFqei65McvN1N5vJMuTfLPX+WFyYwZBsUMjRIDUxXieljipOj8py5pKCF5ypf58Dij8/h9NnLTzQwNLcFwPacum6FPts9GbV0fVR91U/VRN00tOg98yU1epkqgXQcJKxZ6AKhvCfKnwx109UlcKszOivDPA/2LRFxZxpmIWgGNtmt0Y2Zw6pMe/nOxhyW3ucjNVKh6Mo8/VAe4GtCZla3y6IoMXA6zvb8caUOGwpWKg20svcOFQxG8uu0LvPB2gH5p8MM1mRT4TZI2/LaRcw199Pcb4FTI99t58huZnL3cx6MrMkhzDcqhCIPgEEWUExgaRcSZo9QYd7k1vOzmF5qo/Nls8rJVCnMdPL1h+N2v98/3sLOyJRy//O29NsoWprLm3jQKcx3s2BRd5tV/d1D1oTlz//lwG5tXZQLw/VUZAOi65MzlPubPdgKQm26j/lowqo6JjDMV55xHfqmkpjGqDsdRcRHDNbR36fzxUBtav0GaWyXVKbCrNtq6dE7U9bHrjRZ+vu8qwWD0QL1xvINrgSB+n4LHrYKA8w0aOytbeWp/c9hIDn/cRYpDkD/DiWoTnKjrZcvuJk7W9bK2yAtAXZNGbV0vW9dnA9Ac0Nlbcz0Gl9bZ1Ls6EN7iaunwz7RUkbB4LXACV3hjQiJuNWrNV1ARIrRFJRAj+Mb4slpjI9lkJgISObgCiiRymGxxhJUWzSTZB72JwmCcKWFkseKwOV3YsIiwZpp0hUgbwl1cK7RopnLqXMUeFbHX5pPtw6aBz4QBMnWr0li9OTw92BxcAUXwceOzqzUyEnWglWyYmsmQCWjSY5XpQ2YzBn5TnoEJaHqY3SSjWQXZKA3dH72KudHp3CqmtmaGzuUbVRBHpaHfhU2J/BqdOU5lVqmY9BuMCYY090iPqsAeGdQ3CzWZEk1ttyL1IMAeAeAtqf6XTbU/IGyhY4NJ1sypbOZSSoygdqC9pnR5aDZng6EHTwuppIvIe5pjrdBqj6Yol1IaSEMPABsg8u1kSfU9wLtC2LzDt9QmWNopSKZJpAyAjH47OQBvSXU+UAGiaCCQtrpXOSZMETIHbtOF7rMeAGK/6o2EtyTivbkUo743ny5LwTGgGWgEQu/NS4e9N/8fZ+f2FLkRNYwAAAAASUVORK5CYII='
  }
];
const DEFAULT_TOOL_NAME = 'AnnotationEdit';
const TOOL_NAME = 'AnnotationCreateRubberStamp';
const PLACEHOLDER = 'placeholder';
function Webviewer(props) { 
  const [state, dispatch] = useReducer(reducer, initialState);
  const viewerRef = useRef(null);
  const target = useRef(null);  
  const containerRef = useRef(null);
  
  const togglePlaceholder = useCallback(()=>{
    dispatch({type: 'toggle_open'});
  }, [dispatch]);

  const setInstance = useCallback((payload)=>{
    dispatch({type: 'set_instance', payload});
  }, [dispatch]);

  const createAnnotation = useCallback((item)=>{
    console.log('createannotation');
    const stampAnnot = new state.instance.Annotations.StampAnnotation();
    stampAnnot.Icon = item.src;
    const text = item.stamp;
    state.stampTool.setRubberStamp(stampAnnot, text);
    state.stampTool.showPreview();
    togglePlaceholder();
    dispatch({type:'set_annotation', payload:{annotation: stampAnnot}});
  }, [state.instance, state.stampTool, dispatch, togglePlaceholder]);

  const getSelectedAnnotation = useCallback(()=>state.annotation,[state.annotation]);
  
  // const addAnnotation = useCallback((stamp)=>{
  //   // state.docViewer.setToolMode(DEFAULT_TOOL_NAME);
  //   // togglePlaceholder();
  //   // state.docViewer.selectAnnotation(stamp);
  // }, [state.docViewer, togglePlaceholder]);

  // useEffect(() => {
  //   if (state.instance && !_.isEmpty(props.selectedDoc)) {
  //       state.instance.loadDocument(props.selectedDoc, { l: props.config.l, extension: 'pdf' });
  //   }
  // },[state.instance, props.selectedDoc, props.config]);

  
  const headerItem = {
    type: 'customElement',
    //render: () => <PlaceholderStampOverlay />,
    render: () => (
      <>
      <div ref={target} class="Button ToggleElementButton"
        onClick={(ev)=>{
          ev.preventDefault();
          console.log('here');          
          togglePlaceholder();
        }}
      >
        <div class="Icon ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m0 0h24v24h-24z" fill="none"></path><path d="m13.5 15h4.5c1.1045695 0 2 .8954305 2 2v1h-16v-1c0-1.1045695.8954305-2 2-2h4.5v-5.33681558c-1.18247367-.56173197-2-1.76698644-2-3.16318442 0-1.93299662 1.5670034-3.5 3.5-3.5s3.5 1.56700338 3.5 3.5c0 1.39619798-.8175263 2.60145245-2 3.16318442zm-8.5 4h14v2h-14z"></path></svg>
        </div>
      </div>
      </>
    ),    
    // dataElement: 'rubberStampToolButton',
    // element: 'placeholderOverlay'
  };
  
  useEffect(()=>{
    const componentDidMount = async () => {
      const { default: initWv } = await import('@pdftron/webviewer');
  
      const viewerInstance = await initWv({
        ...props.config,
        path: '/lib'
      }, viewerRef.current);

      const { docViewer, annotManager, } = viewerInstance;
      const stampTool = docViewer.getTool(TOOL_NAME);
      console.log(stampTool);
      console.log(annotManager);
      //console.log(stampTool.getdef)
      docViewer.on('mouseLeftUp', (ev)=>{
        stampTool.mouseLeftUp(ev);
        console.log(ev);
      });
      stampTool.on('annotationAdded', async (rubberStampAnnotation)=>{
        console.log('added');
        //const imgItem = rubberStampAnnotation.getCustomData(PLACEHOLDER);
        //if(!_.isEmpty(imgItem)) {
          const stampAnnot = new viewerInstance.Annotations.StampAnnotation();
          stampAnnot.PageNumber = rubberStampAnnotation.PageNumber;
          stampAnnot.X = rubberStampAnnotation.X;
          stampAnnot.Y = rubberStampAnnotation.Y;
          stampAnnot.Width = rubberStampAnnotation.Width; //28
          stampAnnot.Height = rubberStampAnnotation.Height; //length*
          stampAnnot.Icon = rubberStampAnnotation.Subject;
          stampAnnot.ImageData = rubberStampAnnotation.Subject;
          //stampAnnot.setCustomData(PLACEHOLDER, imgItem);

          annotManager.deleteAnnotations([rubberStampAnnotation]);
          annotManager.addAnnotation(stampAnnot);
          annotManager.redrawAnnotation(stampAnnot);
          annotManager.selectAnnotation(stampAnnot);
        //}
      });
      // stampTool.on('annotationCreated', async (rubberStampAnnotation)=>{
      //   console.log('added2');
      //   // docViewer.setToolMode(DEFAULT_TOOL_NAME);
      //   // stampTool.hidePreview();
      //   // docViewer.selectAnnotation(rubberStampAnnotation);
      // });
      // annotManager.on('annotationAdded', async (rubberStampAnnotation)=>{
      //   console.log('added2');
      //   // docViewer.setToolMode(DEFAULT_TOOL_NAME);
      //   // stampTool.hidePreview();
      //   // docViewer.selectAnnotation(rubberStampAnnotation);
      // });
      // //+console.log(stampTool);
      //const annotations = stampTool?.getDefaultStampAnnotations();
      //console.log(annotations);
      //window.instance = viewerInstance;

      //viewerInstance.registerTool({ toolName: 'placeholderStampTool', tooltip: 'Placeholder', } ,viewerInstance.Annotations.StampAnnotation)

      viewerInstance.setHeaderItems(function(header) {
        header.push(headerItem);
      });      
      //{ type: 'toggleElementButton', dataElement: 'placeholderButton', element: 'placeholderOverlay', img: 'ic_annotation_stamp_black_24px', title: 'Placeholer Annotations' },
      // {
      //   type: 'spacer'
      // }
        
  
      // // ref: https://www.pdftron.com/documentation/web/guides/customizing-popup/
      viewerInstance.annotationPopup.add({
        type: 'customElement',
        title: 'Select Signer',
        render: (...args) => {
          const annot = _.head(annotManager.getSelectedAnnotations());
  
          // TODO: set annot.Author and annot.CustomData.type
          console.log('selected annotation', annot);
          //const imgData = annot.getCustomData(PLACEHOLDER);
  
          if (annot instanceof viewerInstance.Annotations.StampAnnotation) {
            return (
              <div>
                <label htmlFor="signer">Signer: </label>
                <select
                  onChange={(ev) => {
                    console.log('annot', annot);
                    // imgData.author = ev.target.value;
                    // annot.setCustomData(PLACEHOLDER, imgData);
                  }}
                >
                  <option value="1">1</option>
                  <option value="1">2</option>
                </select>
              </div>
            )
          }
          return null;
  
        }
      });
  
      setInstance({instance: viewerInstance, stampTool, docViewer, annotManager});
    }

    componentDidMount();
  }, [viewerRef, props.config, headerItem, setInstance, getSelectedAnnotation]);

  // componentDidUpdate = async (prevProps, prevState) => {
  //   if (prevProps.selectedDoc !== this.props.selectedDoc) {
  //     if (!_.isEmpty(this.props.selectedDoc)) {
  //       await this.instance.loadDocument(this.props.selectedDoc, { l: this.props.config.l, extension: 'pdf' });
  //     }
  //   }
  // }

  //render() {
    return (
      <>
        <div
          style={{ height: '100%' }}
          ref={viewerRef}
        />
        <Overlay
          show={state.showPlaceholder}
          target={target}
          placement="left"
          container={containerRef.current}
          containerPadding={20}
          data-element='placeholderOverlay'
        >
          <Popover id="popover-contained" style={{ backgroundColor: 'white' }}>
            {/* <Popover.Title as="h3">Popover bottom</Popover.Title> */}
            <Popover.Content >
            <div style={{minHeight:'360px', minWidth:'360px'}}>
              <div>Signers:</div>
              {placeHoldersSigner.map((img, idx)=>(
                <div key={`notary-${idx}`} onClick={() => createAnnotation(img)}><img src={img.src} alt={img.stamp} /></div>
              ))}
              <hr/>
              <div>Notary:</div>              
              {placeHoldersNotary.map((img,idx)=>(
                <>
                  <div key={`notary-${idx}`} onClick={() => createAnnotation(img)}><img src={img.src} alt={img.stamp} /></div>
                </>
              ))}
            </div>
            </Popover.Content>
          </Popover>
        </Overlay>
    
      </>
    );
  //}
}

export default Webviewer;

// import React, { Component } from 'react'
// import _ from 'lodash';
// import Popover from 'react-bootstrap/Popover';
// import Overlay from 'react-bootstrap/Overlay';
// import Button from 'react-bootstrap/Button';
// import PlaceholderStampOverlay from './placeholderStampOverlay';


// class Webviewer extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { showPlaceHolder: false }
//     this.viewerRef = React.createRef();
//     this.targetRef = React.createRef();
//     this.containerRef = React.createRef();

//     this.togglePlaceholder = this.togglePlaceholder.bind(this);
//   }

//   togglePlaceholder() {
//     this.setState({ showPlaceHolder: !this.state.showPlaceHolder });
//   }

//   // headerItem = {
//   //   type: 'actionButton',
//   //   img: 'ic_annotation_stamp_black_24px',
//   //   onClick: (dispatch) => {
//   //     togglePlaceholder()
//   //   },
//   //   dataElement: 'placeholderButton',
//   // };

//   componentDidMount = async () => {
//     const { default: initWv } = await import('@pdftron/webviewer');

//     const instance = await initWv({
//       ...this.props.config,
//       path: '/lib'
//     }, this.viewerRef.current);


//     this.instance = instance;
//     const { docViewer, } = instance;
//     window.instance = instance;

//     const headerItem = {
//       type: 'customElement',
//       //render: () => <PlaceholderStampOverlay />,
//       render: () => (
//         <>
//         <div ref={this.targetRef} class="Button ToggleElementButton" data-element="placeholderToolButton" 
//           onClick={()=>{
//             console.log('here');
//             //togglePlaceholder();
//             this.togglePlaceholder();
//           }}
//         >
//           <div class="Icon ">
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m0 0h24v24h-24z" fill="none"></path><path d="m13.5 15h4.5c1.1045695 0 2 .8954305 2 2v1h-16v-1c0-1.1045695.8954305-2 2-2h4.5v-5.33681558c-1.18247367-.56173197-2-1.76698644-2-3.16318442 0-1.93299662 1.5670034-3.5 3.5-3.5s3.5 1.56700338 3.5 3.5c0 1.39619798-.8175263 2.60145245-2 3.16318442zm-8.5 4h14v2h-14z"></path></svg>
//           </div>
//         </div>
//         </>
//       )
//     };
//     instance.setHeaderItems(function(header) {
//       header.push(
//         headerItem
//       //   {
//       //   type: 'actionButton',
//       //   img: 'ic_annotation_stamp_black_24px',
//       //   onClick: (dispatch) => {
//       //     toggleFunc();
//       //   },
//       //   dataElement: 'placeholderButton',
//       // },
//         // {
//         //   type: 'customElement',
//         //   //render: () => <PlaceholderStampOverlay />,
//         //   render: () => (
//         //     <>
//         //     <div ref={target} class="Button ToggleElementButton" data-element="placeholderToolButton" 
//         //       onClick={()=>{
//         //         console.log('here');
//         //         //togglePlaceholder();
//         //         toggleFunc();
//         //       }}
//         //     >
//         //       <div class="Icon ">
//         //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m0 0h24v24h-24z" fill="none"></path><path d="m13.5 15h4.5c1.1045695 0 2 .8954305 2 2v1h-16v-1c0-1.1045695.8954305-2 2-2h4.5v-5.33681558c-1.18247367-.56173197-2-1.76698644-2-3.16318442 0-1.93299662 1.5670034-3.5 3.5-3.5s3.5 1.56700338 3.5 3.5c0 1.39619798-.8175263 2.60145245-2 3.16318442zm-8.5 4h14v2h-14z"></path></svg>
//         //       </div>
//         //     </div>
//         //     </>
//         //   )
//         // }

//       );
//     });

//     // ref: https://www.pdftron.com/documentation/web/guides/customizing-popup/
//     instance.annotationPopup.add({
//       type: 'customElement',
//       title: 'Select Signer',
//       render: (...args) => {
//         const annot = _.head(instance.annotManager.getSelectedAnnotations());

//         // TODO: set annot.Author and annot.CustomData.type
//         console.log('selected annotation', annot);

//         if (annot instanceof instance.Annotations.StampAnnotation) {
//           return (
//             <div>
//               <label htmlFor="signer">Signer: </label>
//               <select
//                 onChange={() => {
//                   console.log('annot', annot);
//                 }}
//               >
//                 <option value="1">1</option>
//                 <option value="1">2</option>
//               </select>
//             </div>
//           )
//         }
//         return null;

//       }
//     });
    
//     this.setState({ instance });

//   }

//   componentDidUpdate = async (prevProps, prevState) => {
//     if (prevProps.selectedDoc !== this.props.selectedDoc) {
//       if (!_.isEmpty(this.props.selectedDoc)) {
//         await this.instance.loadDocument(this.props.selectedDoc, { l: this.props.config.l, extension: 'pdf' });
//       }
//     }
//   }

//   render() {
//     return (
//       <>
//         <div
//           style={{ height: '100%' }}
//           ref={this.viewerRef}
//         />
//         <Overlay
//           show={this.state.showPlaceholder}
//           target={this.targetRef}
//           placement="left"
//           container={this.containerRef}
//           containerPadding={20}
//         >
//           <Popover id="popover-contained">
//             <Popover.Title as="h3">Popover bottom</Popover.Title>
//             <Popover.Content>
//               <strong>Holy guacamole!</strong> Check this info.
//             </Popover.Content>
//           </Popover>
//         </Overlay>
//       </>
//     );
//   }
// }

// export default Webviewer;
