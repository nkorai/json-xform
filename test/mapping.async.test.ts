import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { mapToNewObjectAsync, mapWithTemplateAsync } from '../utils/mapping';

chai.use(chaiAsPromised);
chai.should();

describe('Mapping via Async API functions', () => {
  it('Should work as expected for an arbitrary transformation', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'field',
          to: 'array',
          toArray: true
        }
      ]
    };
    const source = {
      field: 'value'
    };
    const target = {
      array: ['value']
    };

    await chai.expect(mapToNewObjectAsync(source, xFormTemplate)).to.eventually.eql(target);
  });

  it('Should work by resolving the promise instead of awaing the result', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'field',
          to: 'array',
          toArray: true
        }
      ]
    };
    const source = {
      field: 'value'
    };
    const target = {
      array: ['value']
    };

    await chai.expect(mapToNewObjectAsync(source, xFormTemplate)).to.eventually.eql(target);
  });

  it('Should throw an error in case improper parameters are passed', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'property.anotherDatefield',
          via: {
            type: 'invalidType',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };
    const source = {
      dateField: '1981-10-03'
    };
    const errorMsg =
      'An error occured during transformation Error: instance.fieldset[0].via.type is not one of enum values: date';

    await chai.expect(mapToNewObjectAsync(source, xFormTemplate)).to.be.rejectedWith(errorMsg);
  });

  it('Should throw an error in case improper parameters are passed and the promise is expected', async () => {
    const xFormTemplate = {
      fieldset: [
        {
          from: 'dateField',
          to: 'property.anotherDatefield',
          via: {
            type: 'invalidType',
            format: 'dd/mm/yyyy',
            sourceFormat: 'yyyy-dd-mm'
          }
        }
      ]
    };
    const source = {
      dateField: '1981-10-03'
    };
    const errorMsg =
      'An error occured during transformation Error: instance.fieldset[0].via.type is not one of enum values: date';

    await chai.expect(mapToNewObjectAsync(source, xFormTemplate)).to.be.rejectedWith(errorMsg);
  });

  describe('Map asynchronously with template from file', () => {
    it('should transform a file via template asynchronously', async () => {
      const result = mapWithTemplateAsync(
        `${__dirname}/mocks/simple-source.json`,
        `${__dirname}/mocks/simple-template.json`
      );

      const target = {
        name: 'Peter',
        lastname: 'Parker',
        occupation: 'Hero with spider superpowers',
        address: {
          street: '31st Street',
          city: 'New York City',
          state: 'NY',
          postCode: '123-ABC'
        }
      };
      await chai.expect(result).to.eventually.eqls(target);
    });

    it('should throw an error tranformation fails', async () => {
      await chai.expect(mapWithTemplateAsync(
        `${__dirname}/mocks/error-source.json`,
        `${__dirname}/mocks/error-template-array.json`
      )).to.be.rejected;
    });
  });
});
