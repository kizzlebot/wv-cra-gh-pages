import _ from 'lodash';

const enablePanels = async ({ instance, config, panels, ...rest }) => {

  _.map(config.panelNames, (name) => {
    if (!panels[name]){
      throw new Error(`Panel ${name} is not registered`);
    }
    
    return instance.setCustomPanel(panels[name]);
  });
  
  return {
    instance,
    config,
    panels,
    ...rest
  }
}

export default enablePanels;