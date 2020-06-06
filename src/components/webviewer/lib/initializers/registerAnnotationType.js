const registerAnnotationType = ({ elementName, annotClassName }) => async ({ instance, annotClasses, ...rest }) => {
  console.log('annotclasses', annotClasses)
  await instance.annotManager.registerAnnotationType(elementName, annotClasses[annotClassName]);
  return ({
    ...rest,
    annotClasses,
    instance,
  })
};



export default registerAnnotationType;