import parseName from '../helpers/parseName';

export const defineAnnotClass = ({ className, baseClassName, customData = {} }) => async ({ instance, annotClasses, ...rest }) => {
  const C = class extends instance.Annotations[baseClassName] {
    constructor(...args) {
      super(...args);
      this.Subject = className;
    }
    draw(ctx, pageMatrix) {
      super.draw(ctx, pageMatrix);
    }
    setSigner(id) {
      const signer = instance.getSignerById(id);
      const fullName = parseName(signer);

      this.FillColor = signer.color;
      this.setContents(`${customData.label}: ${fullName}`);
      this.Author = signer.id;
      const customdata = {
        ...this.CustomData,
        ...customData,
        signerId: id,
        color: [signer.color.R, signer.color.G, signer.color.B, signer.color.A],
        name: fullName,
      };

      // this.setCustomData(customdata);
      this.CustomData = customdata;

      instance.annotManager.redrawAnnotation(this);
      return this;
    }

    setIsRequired(isRequired){
      this.setCustomData({
        ...this.CustomData,
        flags: {
          ...this.CustomData.flags,
          required: isRequired
        }
      });
      this.CustomData = this.CustomData || {};
      this.CustomData.flags = this.CustomData.flags || {};
      this.CustomData.flags.required = isRequired;
    }
  }

  C.prototype.elementName = className;
  Object.defineProperty(C, 'name', { value: className });

  return {
    ...rest,
    instance, 
    annotClasses: {
      ...annotClasses,
      [className]: C
    },
  };
}

export default defineAnnotClass;