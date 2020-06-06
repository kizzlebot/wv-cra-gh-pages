import * as R from 'ramda';
import _ from 'lodash';


export const stringifyObject = R.pipe(
  R.when(R.complement(_.isPlainObject), R.always({})),
  JSON.stringify,
);
export const escapeQuotes = R.replace(/\"/ig, '&quote;');
export const unescapeQuotes = R.replace(/&quot;/ig, '"');
export const jsonToEscaped = R.pipe(stringifyObject, escapeQuotes);
export const escapedToJson = R.pipe(unescapeQuotes, JSON.parse);




export const initXmlParser = (xml) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(xml, 'text/xml');
}


export const xmlFormatter = (xml) => (ids) => {
  const xmlDoc = initXmlParser(xml);
  const parentElement = xmlDoc.querySelector('fields').children[0].children[0];

  // remove all other <fields> except the target id
  _.forEach(Array.from(parentElement.children), (child) => {
    if (ids.indexOf(child.getAttribute('name')) === -1){
      parentElement.removeChild(child);
    }
  });

  const pdfInfo = xmlDoc.querySelector('pdf-info')
  const ffieldsToRemove = pdfInfo.querySelectorAll(`ffield`)
  _.forEach(Array.from(ffieldsToRemove), (ffield) => {
    const found = _.filter(ids, (id) => ffield.getAttribute('name').includes(id));
    if (found.length === 0){
      pdfInfo.removeChild(ffield);
    }
  })

  const widgetsToRemove = pdfInfo.querySelectorAll(`widget`)
  _.forEach(Array.from(widgetsToRemove), (widget) => {
    const found = _.filter(ids, (id) => widget.getAttribute('field').includes(id));
    if (found.length === 0){
      pdfInfo.removeChild(widget);
    }
  })
  


  const rnt = xmlDoc.documentElement.outerHTML;
  return rnt;
}