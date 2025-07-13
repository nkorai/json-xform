import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { mapToNewObjects, mapArrayWithTemplate } from '../utils/mapping';

chai.use(chaiAsPromised);
chai.should();

describe('Process Array data with provided mapping', () => {
  it('Should correctly process all the data provided', async () => {
    const xFormTemplate = {
      fieldset: [{ from: 'random', to: 'precise' }]
    };

    const source = [
      {
        random: 'value one'
      },
      {
        random: 'value two'
      },
      {
        random: 'value three'
      }
    ];

    const target = [
      {
        precise: 'value one'
      },
      {
        precise: 'value two'
      },
      {
        precise: 'value three'
      }
    ];

    await chai.expect(mapToNewObjects(source, xFormTemplate)).to.not.be.rejected;
    await chai.expect(mapToNewObjects(source, xFormTemplate)).to.eventually.eql(target);
  });

  it('Should fail the whole process with an error if invalid data is provided', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'property.anotherDatefield',
          via: {
            type: 'date',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };

    const source = [
      {
        dateField: '1981-10-03'
      },
      {
        dateField: '1991-11-04'
      },
      {
        dateField: '1999-12'
      }
    ];

    const errorMsg =
      'An error occured during transformation Error: Invalid time value error occured when trying to format 1999-12 with dd/mm/yyyy';

    await chai.expect(mapToNewObjects(source, xFormTemplate)).to.be.rejectedWith(errorMsg);
  });

  it('Should fail if non-iterable data are passed', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'anotherDatefield',
          via: {
            type: 'date',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };

    const source = {
      dateField: '1981-10-03'
    };

    await chai.expect(mapToNewObjects(source, xFormTemplate)).to.be.rejected;
  });

  it('Should fail if non-iterable data are passed, even if the flag to continue on errors is set to true', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'anotherDatefield',
          via: {
            type: 'date',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };

    const source = {
      dateField: '1981-10-03'
    };

    await chai.expect(mapToNewObjects(source, xFormTemplate)).to.be.rejected;
  });

  it('Should fail only for the invalid dataset and map all other successfully', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'anotherDatefield',
          via: {
            type: 'date',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };

    const source = [
      {
        dateField: '1981-10-03'
      },
      {
        dateField: '1999-12'
      },
      {
        dateField: '1991-11-04'
      }
    ];

    const target = [
      {
        anotherDatefield: '10/03/1981'
      },
      {
        error:
          'Invalid time value error occured when trying to format 1999-12 with dd/mm/yyyy'
      },
      {
        anotherDatefield: '11/04/1991'
      }
    ];

    await chai.expect(mapToNewObjects(source, xFormTemplate, true)).to.eventually.eql(target);
  });

  it('should transform the source file via a given template file and the output should match the expected one', async () => {
    const result = await mapArrayWithTemplate(
      `${__dirname}/mocks/array-source.json`,
      `${__dirname}/mocks/array-template.json`
    );

    const target = [
      {
        precise: 'value one'
      },
      {
        precise: 'value two'
      },
      {
        precise: 'value three'
      }
    ];
    chai.expect(result).to.eqls(target);
  });

  it('should transform the source file via a given template file and continue on an error if the according flag is set', async () => {
    const target = [
      {
        anotherDatefield: '10/03/1981'
      },
      {
        error:
          'Invalid time value error occured when trying to format 1999-12 with dd/mm/yyyy'
      },
      {
        anotherDatefield: '11/04/1991'
      }
    ];

    await chai.expect(mapArrayWithTemplate(
      `${__dirname}/mocks/error-source-array.json`,
      `${__dirname}/mocks/error-template-array.json`,
      true
    )).to.eventually.eql(target);
  });

  it('should fail with an error when trying to transform invalid data and the according flag is not set', async () => {
    const error = 'Invalid time value error occured when trying to format 1999-12 with dd/mm/yyyy';

    await chai.expect(mapArrayWithTemplate(
      `${__dirname}/mocks/error-source-array.json`,
      `${__dirname}/mocks/error-template-array.json`,
      false
    )).to.be.rejectedWith(error);
  });
});
