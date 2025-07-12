'use-strict'

const fs = require('fs')

export const readJSON = (jsonFile) => {
  const handle = fs.readFileSync(jsonFile, 'UTF8')
  return JSON.parse(handle)
}
