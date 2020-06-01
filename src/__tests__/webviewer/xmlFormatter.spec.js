import { 
  escapeQuotes, 
  unescapeQuotes,
  stringifyObject, 
  jsonToEscaped, 
  escapedToJson,
  initXmlParser,
  recurseFindFieldPaths
} from 'components/webviewer/lib/xmlFormatter';

const xml = `
  <xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">
    <fields>
      <field name="signature">
        <field name="1590913456510">
          <field name="1f12b8ea-8d63-b33f-3489-fec77538232c">
            <field name="1">
              <field name="1">
                <field name="james Choi"/>
              </field>
            </field>
          </field>
          <field name="be2b1f9d-6c48-173c-3a9f-8d3730f31699">
            <field name="1">
              <field name="1">
                <field name="james Choi"/>
              </field>
            </field>
          </field>
        </field>
      </field>
    </fields>
    
    <pages>
      <defmtx matrix="1.333333,0.000000,0.000000,-1.333333,0.000000,1056.000000"/>
    </pages>
    <pdf-info xmlns="http://www.pdftron.com/pdfinfo" import-version="3" version="2">
      <ffield name="signature.1590913456510.1f12b8ea-8d63-b33f-3489-fec77538232c.1.1.james Choi" type="Sig">
        <font name="Helvetica"/>
      </ffield>
      <ffield name="signature.1590913456510.be2b1f9d-6c48-173c-3a9f-8d3730f31699.1.1.james Choi" type="Sig">
        <font name="Helvetica"/>
      </ffield>
      <widget appearance="_DEFAULT" page="1" field="signature.1590913456510.1f12b8ea-8d63-b33f-3489-fec77538232c.1.1.james Choi">
        <rect y2="556.0625" x2="375" y1="451.375" x1="96.875"/>
        <appearances>
          <aappearance name="_DEFAULT">
            <Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal>
          </aappearance>
        </appearances>
        <trn-custom-data bytes="{&quot;author&quot;:&quot;1&quot;,&quot;color&quot;:&quot;153,215,114,0.5&quot;,&quot;fieldType&quot;:&quot;SIGNATURE&quot;,&quot;flag&quot;:&quot;&quot;,&quot;id&quot;:&quot;1f12b8ea-8d63-b33f-3489-fec77538232c&quot;,&quot;name&quot;:&quot;james Choi&quot;,&quot;signerId&quot;:&quot;1&quot;,&quot;type&quot;:&quot;SIGNATURE&quot;,&quot;value&quot;:&quot;&quot;}"/>
      </widget>
      <widget appearance="_DEFAULT" page="1" field="signature.1590913456510.be2b1f9d-6c48-173c-3a9f-8d3730f31699.1.1.james Choi">
        <rect y2="218.5625" x2="560.9375" y1="198.25" x1="182.8125"/>
        <appearances>
          <aappearance name="_DEFAULT">
            <Normal>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=</Normal>
          </aappearance>
        </appearances>
        <trn-custom-data bytes="{&quot;author&quot;:&quot;1&quot;,&quot;color&quot;:&quot;153,215,114,0.5&quot;,&quot;fieldType&quot;:&quot;SIGNATURE&quot;,&quot;flag&quot;:&quot;&quot;,&quot;id&quot;:&quot;be2b1f9d-6c48-173c-3a9f-8d3730f31699&quot;,&quot;name&quot;:&quot;james Choi&quot;,&quot;signerId&quot;:&quot;1&quot;,&quot;type&quot;:&quot;SIGNATURE&quot;,&quot;value&quot;:&quot;&quot;}"/>
      </widget>
    </pdf-info>
  </xfdf>
`;

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
      console.log(obj);
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
      // console.log(xmlDoc.documentElement.outerHTML);
      const fields = xmlDoc.querySelector('fields');
      const rtn = recurseFindFieldPaths(fields);
      expect(rtn).toBeInstanceOf(Array)
    });
  });

  
})