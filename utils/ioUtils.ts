
import fs from 'fs';

export const readJSON = (jsonFile) => {
  const handle = fs.readFileSync(jsonFile, { encoding: 'utf8' });
  return JSON.parse(handle);
};
