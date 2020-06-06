import { 
  escapeQuotes, 
  unescapeQuotes,
  stringifyObject, 
  jsonToEscaped, 
  escapedToJson,
  initXmlParser,
  xmlFormatter,
} from 'components/webviewer/lib/helpers/xmlFormatter';

const xml = `
  <xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><pdf-info xmlns="http://www.pdftron.com/pdfinfo" version="2" import-version="3"><ffield type="Sig" name="signature.1591028098891.938b5960-b616-3e53-5535-9c5b12261018.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="signature.1591028098891.57d06a8e-5a45-8504-e54c-72d3227ba5fe.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="signature.1591028098892.be1356f6-263c-c2f6-de8d-3b872c383d79.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="initials.1591028098892.e21aa576-6a9e-57c4-08fa-753354e662ca.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="initials.1591028098892.71bd8c66-9bff-81f9-1547-e1c119fa5b5d.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="initials.1591028098892.b5e44859-772d-043c-6b27-980d469ad93d.1.1.james Choi"><font name="Helvetica"/></ffield><ffield type="Sig" name="initials.1591028098892.7271b178-858a-487d-3bf6-55bd6f05b779.1.1.james Choi"><font name="Helvetica"/></ffield><widget appearance="_DEFAULT" field="signature.1591028098891.938b5960-b616-3e53-5535-9c5b12261018.1.1.james Choi" page="1"><rect x1="154.6875" x2="482.8125" y1="727.9375" y2="771.6875"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="signature.1591028098891.57d06a8e-5a45-8504-e54c-72d3227ba5fe.1.1.james Choi" page="1"><rect x1="132.8125" x2="492.1875" y1="637.3125" y2="682.625"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="signature.1591028098892.be1356f6-263c-c2f6-de8d-3b872c383d79.1.1.james Choi" page="1"><rect x1="90.625" x2="504.6875" y1="512.3125" y2="562.3125"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="initials.1591028098892.e21aa576-6a9e-57c4-08fa-753354e662ca.1.1.james Choi" page="1"><rect x1="117.1875" x2="575" y1="392" y2="476.375"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="initials.1591028098892.71bd8c66-9bff-81f9-1547-e1c119fa5b5d.1.1.james Choi" page="1"><rect x1="79.6875" x2="514.0625" y1="285.75" y2="348.25"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="initials.1591028098892.b5e44859-772d-043c-6b27-980d469ad93d.1.1.james Choi" page="1"><rect x1="43.75" x2="473.4375" y1="187.3125" y2="257.625"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget><widget appearance="_DEFAULT" field="initials.1591028098892.7271b178-858a-487d-3bf6-55bd6f05b779.1.1.james Choi" page="1"><rect x1="114.0625" x2="581.25" y1="70.125" y2="146.6875"/><appearances><aappearance name="_DEFAULT"><Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal></aappearance></appearances></widget></pdf-info><fields><field name="signature"><field name="1591028098891"><field name="938b5960-b616-3e53-5535-9c5b12261018"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field><field name="57d06a8e-5a45-8504-e54c-72d3227ba5fe"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field></field><field name="1591028098892"><field name="be1356f6-263c-c2f6-de8d-3b872c383d79"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field></field></field><field name="initials"><field name="1591028098892"><field name="e21aa576-6a9e-57c4-08fa-753354e662ca"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field><field name="71bd8c66-9bff-81f9-1547-e1c119fa5b5d"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field><field name="b5e44859-772d-043c-6b27-980d469ad93d"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field><field name="7271b178-858a-487d-3bf6-55bd6f05b779"><field name="1"><field name="1"><field name="james Choi"><value>_DEFAULT</value></field></field></field></field></field></field></fields><annots/><pages><defmtx matrix="1,0,0,-1,0,792"/></pages></xfdf>
`;

const ids = [
  '938b5960-b616-3e53-5535-9c5b12261018',
  '57d06a8e-5a45-8504-e54c-72d3227ba5fe',
  'be1356f6-263c-c2f6-de8d-3b872c383d79',
  'e21aa576-6a9e-57c4-08fa-753354e662ca',
  '71bd8c66-9bff-81f9-1547-e1c119fa5b5d',
  'b5e44859-772d-043c-6b27-980d469ad93d',
  '7271b178-858a-487d-3bf6-55bd6f05b779'
];




describe('xmlFormatter', () => {

  describe('escapeQuotes', () => {


    it('should exist', () => {
      expect(escapeQuotes).toBeDefined();
    });

    it('should replace double quotes with "&quote;"', () => {
      expect(escapeQuotes(`""`)).toEqual('&quote;&quote;')
    });

  });


  describe('stringifyObject', () => {

    it('should stringify object', () => {
      expect(stringifyObject({ name: 'James' })).toEqual(`{"name":"James"}`)
    });
    
    it('should default to an empty object if JSON.stringify throws', () => {
      expect(stringifyObject('James')).toEqual(`{}`)
    });

  });


  describe('jsonToEscaped', () => {
    it('should JSON.stringify object and replace double quotes with &quote;', () => {

      const escaped = jsonToEscaped({
        name: 'james'
      });

      expect(escaped).toEqual('{&quote;name&quote;:&quote;james&quote;}');
    });
  });


  describe('unescapeQuotes', () => {
    it('should unescape &quot;', () => {
      const str = `{&quot;author&quot;:&quot;1&quot;,&quot;color&quot;:&quot;153,215,114,0.5&quot;,&quot;fieldType&quot;:&quot;SIGNATURE&quot;,&quot;flag&quot;:&quot;&quot;,&quot;id&quot;:&quot;be2b1f9d-6c48-173c-3a9f-8d3730f31699&quot;,&quot;name&quot;:&quot;james Choi&quot;,&quot;signerId&quot;:&quot;1&quot;,&quot;type&quot;:&quot;SIGNATURE&quot;,&quot;value&quot;:&quot;&quot;}`

      const obj = unescapeQuotes(str);
    });
  });

  describe('escapedToJson', () => {
    it('should unescape an escaped json object', () => {
      const str = `{&quot;author&quot;:&quot;1&quot;,&quot;color&quot;:&quot;153,215,114,0.5&quot;,&quot;fieldType&quot;:&quot;SIGNATURE&quot;,&quot;flag&quot;:&quot;&quot;,&quot;id&quot;:&quot;be2b1f9d-6c48-173c-3a9f-8d3730f31699&quot;,&quot;name&quot;:&quot;james Choi&quot;,&quot;signerId&quot;:&quot;1&quot;,&quot;type&quot;:&quot;SIGNATURE&quot;,&quot;value&quot;:&quot;&quot;}`

      const obj = escapedToJson(str);
      expect(obj).toBeInstanceOf(Object)
      expect(obj.author).toEqual('1');
      expect(obj.fieldType).toEqual('SIGNATURE');
    });
  });


  describe('initXmlParser', () => {
    it("should inistantiate xml", () => {
      const xmlDoc = initXmlParser(xml);
      expect(xmlDoc).toBeDefined();
    });
  });



  describe('xmlFormatter', () => {
    it('should format the xml and exclude wiget, field, and ffields not in ids', () => {
      const [firstId, ...restIds] = ids;
      const xfdf = xmlFormatter(xml)(restIds);
      expect(xfdf).toBeDefined();
      expect(xfdf.includes(firstId)).toEqual(false);
      expect(xfdf.includes(restIds[0])).toEqual(true);
    });
  });
})