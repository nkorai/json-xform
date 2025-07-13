import { schema } from './schema';
import { validate } from 'jsonschema';

export const validateWithSchema = (jsonToValidate) => {
  return validate(jsonToValidate, schema);
};

export const validationUtil = {
  getErrorMessage: (result) => {
    return result.errors.map((error) => {
      return error.stack;
    }).reduce((acc, curr) => {
      return `${acc}\n${curr}`;
    });
  }
};
