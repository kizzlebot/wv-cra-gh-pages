const config = '/wv-configs/config.js';

export default {
  l: 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7',
  path: `${process.env.PUBLIC_URL}/lib`,
  fullAPI: true,
  // config: config ? `${process.env.PUBLIC_URL}${config}` : undefined,
  config,

  custom: {
    fitMode: 'FitPage',
    mode: 'templating',
    disableFeatures: [
      'TextSelection',
      'NotesPanel',
      'FilePicker',
      'Redaction',
      'Copy',
      'Download',
      'Print',
    ],
    disableTools: [
      'AnnotationCreatePolygon',
      'AnnotationCreateTextHighlight',
      'AnnotationCreateTextUnderline',
    ],
    disableElements: [
      'stickyToolButton',
      'leftPanel',
      'freeHandToolGroupButton',
      'menuButton',
      'miscToolGroupButton',
      'leftPanelButton',
      'searchButton',
      'textToolGroupButton',
      'viewControlsButton',
      'linkButton',
      'shapeToolGroupButton',
      'eraserToolButton',
    ],
  },
};
