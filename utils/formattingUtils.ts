import { format as dFormat, parse } from 'date-fns';
import { executeTransformationCommands } from './transformUtils';

export const createFormatter = (type) => {
  switch (type) {
    case 'date':
      return dateFormatter;
    case 'commands':
      return commandsFormatter;
    default:
      throw Error(`There's no type named ${type} known currently`);
  }
};

export const dateFormatter = (value, { format, sourceFormat }) => {
  try {
    const date = parse(value, sourceFormat, new Date());
    return dFormat(date, format);
  } catch (ex) {
    throw Error(
      `${(ex as Error).message} error occured when trying to format ${value} with ${format}`
    );
  }
};

const commandsFormatter = (value, { transform }) => {
  return executeTransformationCommands(value, transform);
};

export const formatPropValueIfNecessary = (propValue, via) => {
  if (!via) {
    return propValue;
  }

  const formatter = createFormatter(via.type);
  return formatter(propValue, via);
};
