import * as R from 'ramda';
import { injectToolArr } from "../initializers/injectors";
import registerFormFieldTools from "./formFields";
import registerTemplateTools from "./templating";
import registerStampAnnotTool from "./stamps";
import registerNotaryCertTool from "./notaryCerts";

const registerTools = R.pipeP(
  injectToolArr,
  registerNotaryCertTool,
  registerFormFieldTools,
  registerTemplateTools,
  registerStampAnnotTool,
)
export default registerTools;