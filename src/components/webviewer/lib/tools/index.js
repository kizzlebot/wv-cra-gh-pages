import * as R from 'ramda';
import { injectToolArr } from "../initializers/injectors";
import registerFormFieldTools from "./formFields";
import registerTemplateTools from "./templating";
import registerStampAnnotTool from "./stamps";
import registerNotaryCertTool from "./notaryCerts";
import registerAddRemovePage from './addRemovePage';
import registerRemoveFormFields from './removeFormFields';
import registerSelectSigner from './selectSigner';
import registerShowSigner from './showSigner';
import registerLockCheckbox from './lock';


const registerTools = R.pipeP(
  registerSelectSigner,
  registerShowSigner,
  registerAddRemovePage,
  registerRemoveFormFields,
  registerNotaryCertTool,
  registerFormFieldTools,
  registerTemplateTools,
  registerStampAnnotTool,
  registerLockCheckbox
);

export default registerTools;