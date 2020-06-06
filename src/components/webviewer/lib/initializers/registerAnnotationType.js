const registerAnnotationType = ({ elementName, annotClassName }) => async ({ instance, annotClasses, ...rest }) => {
  await instance.annotManager.registerAnnotationType(annotClasses[annotClassName].prototype.elementName, annotClasses[annotClassName]);
  return ({
    ...rest,
    annotClasses,
    instance,
  })
};



export default registerAnnotationType;