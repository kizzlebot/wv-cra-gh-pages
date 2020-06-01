import _ from 'lodash';

const registerTool = ({
  toolName,
  buttonImage,
  buttonName,
  tooltip
}, opts = {}) => async ({ instance, tools, header, toolObject, annotClass, ...rest }) => {

  if (opts.clearOnDraw){
    toolObject.on('annotationAdded', () => {
      return instance.setActiveHeaderGroup('default');
    })
  }

  // register the tool
  await instance.registerTool({
    toolName,
    buttonImage,
    buttonName,
    tooltip,
    toolObject,
  }, annotClass);


  return {
    ...rest,
    instance,
    tools,
    header: [...header, {
      type: 'toolButton',
      toolName,
      dataElement: _.lowerFirst(toolName),
      hidden: ['tablet', 'mobile'],
    }]
  };
}


export default registerTool;