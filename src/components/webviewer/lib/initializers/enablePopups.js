import _ from 'lodash';
const enablePopups = async ({ instance, config, tools, ...rest }) => {
  _.map(config.popupNames, (name) => {
    if (!tools[name]){
      throw new Error(`Popup ${name} is not registered`);
    }
    
    return instance.annotationPopup.add(tools[name]);
  })
  
  return {
    instance,
    config,
    tools,
    ...rest
  }
}

export default enablePopups;