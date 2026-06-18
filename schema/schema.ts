export const schema = {
  type: 'object',
  properties: {
    via: {
      id: '/Via',
      type: 'object',
      properties: {
        type: { type: 'string', required: true, enum: ['date', 'commands'] },
        sourceFormat: { type: 'string' },
        format: { type: 'string' },
        transform: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              command: { type: 'string', required: true },
              map: { type: 'boolean', required: false, default: false },
              params: { type: 'array', minItems: 0 }
            }
          }
        }
      },
      anyOf: [
        {
          properties: {
            type: { const: 'date' }
          },
          required: ['sourceFormat', 'format']
        },
        {
          properties: {
            type: { const: 'commands' }
          },
          required: ['transform']
        }
      ]
    },
    fieldset: {
      id: '/Fieldset',
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          valueToKey: { type: 'boolean' },
          withValueFrom: { type: 'string' },
          withTemplate: { type: 'string' },
          toArray: { type: 'boolean' },
          // fromArray: multi-source array builder. Mirrors `from` for the
          // case where the target should be a list assembled from several
          // distinct source paths. Output order matches the order of paths.
          fromArray: {
            type: 'array',
            items: { type: 'string' }
          },
          // Optional modifiers paired with `fromArray`. Documented in README.
          skipEmpty: { type: 'boolean' },
          unique: { type: 'boolean' },
          flatten: { type: 'boolean' },
          via: { $ref: '/Via' },
          fromEach: {
            type: 'object',
            properties: {
              field: { type: 'string', required: true },
              to: { type: 'string' },
              flatten: { type: 'boolean' },
              fieldset: { $ref: '/Fieldset' }
            }
          }
        },
        anyOf: [
          {
            allOf: [
              {
                dependencies: {
                  withTemplate: {
                    oneOf: [
                      { required: ['to'] },
                      { required: ['withValueFrom'] }
                    ]
                  }
                }
              }
            ],
            oneOf: [{ required: ['from'] }, { required: ['withTemplate'] }]
          },
          { required: ['fromEach'] },
          // fromArray entries always need an explicit `to` — there is no
          // implicit derivation rule like there is for single-path `from`.
          { required: ['fromArray', 'to'] }
        ]
      }
    }
  },
  required: ['fieldset']
};
