import _ from 'lodash';

const registerTool = ({
  toolName,
  annotClassName,
  buttonImage,
  buttonName,
  tooltip
}, opts = {}) => async ({ instance, tools, toolClasses, header, annotClasses, ...rest }) => {


  // register the tool
  const toolObject = new toolClasses[toolName](instance.docViewer);
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
    toolClasses,
    annotClasses,
    tools: {
      ...tools,
      [toolName]: {
        type: 'toolButton',
        toolName,
        dataElement: _.lowerFirst(toolName),
        hidden: ['tablet', 'mobile'],
      }
    },
    header: [...header, {
      type: 'toolButton',
      toolName,
      dataElement: _.lowerFirst(toolName),
      hidden: ['tablet', 'mobile'],
    }]
  };
}


export default registerTool;