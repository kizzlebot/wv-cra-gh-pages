// __mocks__/webviewer.js


const initWv = async (config, domElement) => {
  const iframe = document.createElement('iframe');
  domElement.appendChild(iframe);

  const instance = {
    docViewer: {
      one(evtName, callback){

        console.log('CoreControls', window.Annotations);
        // if (evtName === 'ready'){
        //   callback(instance)
        // }

      }
    }
  }
  return instance;
}
module.exports = initWv;