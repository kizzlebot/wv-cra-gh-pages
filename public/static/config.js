/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
// @ts-nocheck
((exports) => {
  exports.runCustomClicked = async (instance) => {
    const { PDFNet, annotManager } = instance;

    PDFNet.CheckStyle = {
      e_check: 0,
      e_circle: 1,
      e_cross: 2,
      e_diamond: 3,
      e_square: 4,
      e_star: 5,
    };

    const renameAllFields = async (doc, name) => {
      let itr = await doc.getFieldIterator(name);

      for (let counter = 0; await itr.hasNext(); itr = await doc.getFieldIterator(name), ++counter) {
        const f = await itr.current();

        f.rename(name + counter);
      }
    };

    // Note: The visual appearance of check-marks and radio-buttons in PDF documents is
    // not limited to CheckStyle-s. It is possible to create a visual appearance using
    // arbitrary glyph, text, raster image, or path object. Although most PDF producers
    // limit the options to the above 'standard' styles, using PDFNetJS you can generate
    // arbitrary appearances.
    const createCheckmarkAppearance = async (doc, style) => {
      const builder = await PDFNet.ElementBuilder.create();
      const writer = await PDFNet.ElementWriter.create();

      writer.begin(doc);
      writer.writeElement(await builder.createTextBegin());

      let symbol;

      switch (style) {
        case PDFNet.CheckStyle.e_circle:
          symbol = '\x6C';
          break;
        case PDFNet.CheckStyle.e_diamond:
          symbol = '\x75';
          break;
        case PDFNet.CheckStyle.e_cross:
          symbol = '\x35';
          break;
        case PDFNet.CheckStyle.e_square:
          symbol = '\x6E';
          break;
        case PDFNet.CheckStyle.e_star:
          symbol = '\x48';
          break;
        // ...
        // See section D.4 "ZapfDingbats Set and Encoding" in PDF Reference Manual
        // (http://www.pdftron.com/downloads/PDFReference16.pdf) for the complete
        // graphical map for ZapfDingbats font. Please note that all character codes
        // are represented using the 'octal' notation.
        default:
          // e_check
          symbol = '\x34';
      }

      const zapfDingbatsFont = await PDFNet.Font.create(doc, PDFNet.Font.StandardType1Font.e_zapf_dingbats);
      const checkmark = await builder.createTextRunWithSize(symbol, 1, zapfDingbatsFont, 1);

      writer.writeElement(checkmark);
      writer.writeElement(await builder.createTextEnd());

      const stm = await writer.end();

      await stm.putRect('BBox', -0.2, -0.2, 1, 1);
      // Clip
      await stm.putName('Subtype', 'Form');

      return stm;
    };

    const CreateButtonAppearance = async (doc, buttonDown) => {
      // Create a button appearance stream ------------------------------------

      const builder = await PDFNet.ElementBuilder.create();
      const writer = await PDFNet.ElementWriter.create();

      writer.begin(doc);

      // Draw background
      let element = await builder.createRect(0, 0, 101, 37);

      element.setPathFill(true);
      element.setPathStroke(false);

      let elementGState = await element.getGState();

      elementGState.setFillColorSpace(await PDFNet.ColorSpace.createDeviceGray());
      elementGState.setFillColorWithColorPt(await PDFNet.ColorPt.init(0.75));
      writer.writeElement(element);

      // Draw 'Submit' text
      writer.writeElement(await builder.createTextBegin());

      const text = 'Submit';
      const HelveticaBoldFont = await PDFNet.Font.create(doc, PDFNet.Font.StandardType1Font.e_helvetica_bold);

      element = await builder.createTextRunWithSize(text, text.length, HelveticaBoldFont, 12);
      elementGState = await element.getGState();
      elementGState.setFillColorWithColorPt(await PDFNet.ColorPt.init(0));

      if (buttonDown) {
        element.setTextMatrixEntries(1, 0, 0, 1, 33, 10);
      } else {
        element.setTextMatrixEntries(1, 0, 0, 1, 30, 13);
      }

      writer.writeElement(element);

      writer.writeElement(await builder.createTextEnd());

      const stm = await writer.end();

      // Set the bounding box
      await stm.putRect('BBox', 0, 0, 101, 37);
      await stm.putName('Subtype', 'Form');

      return stm;
    };

    const run = async () => {
      await PDFNet.initialize();

      const doc = await instance.docViewer.getDocument().getPDFDoc();
      const root = await doc.getRoot();
      // (/Root entry within the trailer dictionary)

      doc.initSecurityHandler();
      doc.lock();
      console.log('PDF document initialized and locked');

      const blankPage = await doc.pageCreate();

      // create new fields
      const empFirstName = await doc.fieldCreateFromStrings('employee.name.first', PDFNet.Field.Type.e_text, 'John', '');
      const empLastName = await doc.fieldCreateFromStrings('employee.name.last', PDFNet.Field.Type.e_text, 'Doe', '');
      const empLastCheck1 = await doc.fieldCreateFromStrings('employee.name.check1', PDFNet.Field.Type.e_check, 'Yes', '');

      const submit = await doc.fieldCreate('submit', PDFNet.Field.Type.e_button);

      // Create page annotations for the above fields.

      // Create text annotation
      const annot1 = await PDFNet.WidgetAnnot.create(doc, await PDFNet.Rect.init(50, 550, 350, 600), empFirstName);
      const annot2 = await PDFNet.WidgetAnnot.create(doc, await PDFNet.Rect.init(50, 450, 350, 500), empLastName);

      // create checkbox annotation
      const annot3 = await PDFNet.WidgetAnnot.create(doc, await PDFNet.Rect.init(64, 356, 120, 410), empLastCheck1);
      // Set the annotation appearance for the "Yes" state
      // NOTE: if we call refreshFieldAppearances after this the appearance will be discarded
      const checkMarkApp = await createCheckmarkAppearance(doc, PDFNet.CheckStyle.e_check);

      // Set the annotation appearance for the "Yes" state...
      annot3.setAppearance(checkMarkApp, PDFNet.Annot.State.e_normal, 'Yes');

      // Create button annotation
      const annot4 = await PDFNet.WidgetAnnot.create(doc, await PDFNet.Rect.init(64, 284, 163, 320), submit);
      // Set the annotation appearances for the down and up state...
      const falseButtonApp = await CreateButtonAppearance(doc, false);
      const trueButtonApp = await CreateButtonAppearance(doc, true);

      await annot4.setAppearance(falseButtonApp, PDFNet.Annot.State.e_normal);
      await annot4.setAppearance(trueButtonApp, PDFNet.Annot.State.e_down);

      // Create 'SubmitForm' action. The action will be linked to the button.
      const url = await PDFNet.FileSpec.createURL(doc, 'http://www.pdftron.com');
      const buttonAction = await PDFNet.Action.createSubmitForm(url);

      // Associate the above action with 'Down' event in annotations action dictionary.
      const annotAction = await (await annot4.getSDFObj()).putDict('AA');

      annotAction.put('D', await buttonAction.getSDFObj());

      blankPage.annotPushBack(annot1);
      // Add annotations to the page
      blankPage.annotPushBack(annot2);
      blankPage.annotPushBack(annot3);
      blankPage.annotPushBack(annot4);

      doc.pagePushBack(blankPage);
      // Add the page as the last page in the document.

      doc.refreshFieldAppearances();
      await instance.docViewer.refreshAll();
      await instance.docViewer.updateView();
      await instance.docViewer.getDocument().refreshTextData();
      console.log('annot4', annot4);

      return {
        root,
        doc,
      };
    };

    return run;
  };


  // window.addEventListener('viewerLoaded', async () => {
  window.addEventListener('viewerLoaded', async () => {
    // TODO: use this when at v6.3
    // readerControl.setColorPalette(['#000000', '#4B92DB']);


    const annotManager = readerControl.docViewer.getAnnotationManager();

    // disables hotkeys when document loads
    readerControl.docViewer.on('annotationsLoaded', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });

    // disables hotkeys when annotManager.setCurrentUser() is called
    annotManager.on('updateAnnotationPermission', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });
  });
})(window);
