const registerAnnotationType = ({ elementName }) => async ({ instance, annotClass, ...rest }) => {
  await instance.annotManager.registerAnnotationType(elementName, annotClass);

  return ({
    ...rest,
    instance,
    annotClass
  })
};



export default registerAnnotationType;