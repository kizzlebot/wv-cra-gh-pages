module.exports = (instance) => (config = {}) => {
  const { disableFeatures = [], disableTools = [], fitMode, disableElements = [] } = config;

  const { FitMode } = instance;
  if (fitMode) {
    instance.setFitMode(FitMode[fitMode] || FitMode.FitWidth);
  }



  const toDisable = _.pick(instance.Feature, disableFeatures);
  const toEnable = _.omit(instance.Feature, disableFeatures);

  instance.disableFeatures([..._.values(toDisable)]);



  instance.disableTools([...disableTools]);
  instance.disableElements([...disableElements]);

  return { instance }
};

