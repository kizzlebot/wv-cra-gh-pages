import _ from 'lodash';

const registerTool = ({
  toolName,
  annotClassName,
  buttonImage,
  buttonName,
  tooltip
}, opts = {}) => async ({ instance, tools, header, annotClasses, ...rest }) => {


  // register the tool
  const toolObject = new tools[toolName](instance.docViewer);
  if (opts.clearOnDraw){
    toolObject.on('annotationAdded', () => {
      return instance.setActiveHeaderGroup('default');
    })
  }
  
  await instance.registerTool({
    toolName,
    buttonImage,
    buttonName,
    tooltip,
    toolObject,
  }, annotClasses[annotClassName]);


  return {
    ...rest,
    instance,
    tools,
    annotClasses,
    header: [...header, {
      type: 'toolButton',
      toolName,
      dataElement: _.lowerFirst(toolName),
      hidden: ['tablet', 'mobile'],
    }]
  };
}


export default registerTool;