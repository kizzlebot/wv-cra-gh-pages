import _ from 'lodash';
import { toFullName } from '../helpers/parseName';

const createTextField = ({ name, label, annotClassName }) => ({ instance, annotClasses, tools, header, ...rest }) => {
  const { Annotations, docViewer } = instance;
  const annotManager = instance.docViewer.getAnnotationManager();

  return async (rectAnnot, custom = {}) => {
    const {
      type = _.toUpper(name),
      value = '',
      flags = { readOnly: false, multiline: false, edit: true, required: true }
    } = (custom || {});

    // console.debug('type', type);
    const pageIndex = (rectAnnot?.PageNumber) ? rectAnnot.PageNumber - 1 : docViewer.getCurrentPage() - 1;


    const zoom = docViewer.getZoom();
    const CustomAnnot = annotClasses[annotClassName];
    const textAnnot = new CustomAnnot();

    const rotation = docViewer.getCompleteRotation(pageIndex + 1) * 90;
    textAnnot.Rotation = rotation;
    textAnnot.X = rectAnnot.X;
    textAnnot.Y = rectAnnot.Y;
    textAnnot.Width = rectAnnot.Width;
    textAnnot.Height = rectAnnot.Height;
    textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
    textAnnot.Author = instance.annotManager.getCurrentUser();

    // get currently selected signer.
    const signerId = instance.getSigner();
    const signer = instance.getSignerById(signerId);


    textAnnot.custom = {
      ...custom,
      type,
      value,
      flags: flags,
      fieldType: type,
      signerId: signer.id,
      id: rectAnnot.Id,
      color: [signer.color.R, signer.color.G, signer.color.B, signer.color.A],
      author: annotManager.getCurrentUser(),
      name: `${signer?.firstName ? signer.firstName : signer?.user?.firstName} ${signer?.lastName ? signer.lastName : signer?.user?.lastName}`
    };

    textAnnot.custom.fullName = toFullName(textAnnot.custom.name);


    // _.mapKeys(textAnnot.custom, (val, key) => textAnnot.setCustomData(key, (val || '').toString()));
    textAnnot.CustomData = textAnnot.custom;
    textAnnot.setContents(`${label ? label : name}: ${toFullName(textAnnot.custom.name)}`);
    textAnnot.FontSize = `${15.0 / zoom}px`;
    textAnnot.FillColor = rectAnnot.FillColor;
    textAnnot.TextColor = new Annotations.Color(0, 0, 0);
    textAnnot.FillColor = new Annotations.Color(...[signer.color.R, signer.color.G, signer.color.B, signer.color.A]);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = 'center';
    textAnnot.PageNumber = rectAnnot?.PageNumber || (pageIndex + 1);
    textAnnot.LockedContents = true;


    // TODO: Set the author here
    // textAnnot.Author = annotManager.getCurrentUser();
    await annotManager.deleteAnnotation(rectAnnot, true);
    await annotManager.addAnnotation(textAnnot, false);
    await annotManager.deselectAllAnnotations();
    await annotManager.redrawAnnotation(textAnnot);
    await annotManager.selectAnnotation(textAnnot);
  };
};

export default createTextField;