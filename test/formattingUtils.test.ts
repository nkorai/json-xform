import { expect } from 'chai';

import { createFormatter, dateFormatter } from '../utils/formattingUtils';

describe('The expected formatter is returned', () => {
  it('should return the requested formatter', () => {
    [{ type: 'date', formatter: dateFormatter }].forEach((requested) => {
      const returned = createFormatter(requested.type);
      expect(returned.toString()).to.equal(requested.formatter.toString());
    });
  });

  it('should fail with the expected error message if an unknown type is provided', () => {
    expect(() => createFormatter('lalala')).to.throw(
      "There's no type named lalala known currently"
    );
  });
});
