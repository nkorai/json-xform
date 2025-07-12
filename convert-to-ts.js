const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Helper to write files
const writeFile = (filename, content) => {
  fs.writeFileSync(filename, content.trim() + '\n', 'utf-8')
  console.log(`✅ Wrote ${filename}`)
}

// Step 1: Install dev dependencies
console.log('📦 Installing TypeScript and Webpack...')
execSync('npm install --save-dev typescript ts-loader webpack webpack-cli', {
  stdio: 'inherit'
})

// Step 2: Initialize tsconfig
console.log('📄 Creating tsconfig.json...')
writeFile(
  'tsconfig.json',
  `
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["index.ts", "utils/**/*.ts", "schema/**/*.ts"]
}
`
)

// Step 3: Create webpack.config.js
console.log('⚙️ Creating webpack.config.js...')
writeFile(
  'webpack.config.js',
  `
const path = require('path');

module.exports = {
  entry: './index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  }
};
`
)

// Step 4: Rename .js to .ts
const walk = (dir) => {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      walk(fullPath)
    } else if (file.endsWith('.js')) {
      const newPath = fullPath.replace(/\.js$/, '.ts')
      fs.renameSync(fullPath, newPath)
      console.log(`🔁 Renamed ${fullPath} -> ${newPath}`)
    }
  }
}
console.log('✏️ Renaming .js files to .ts...')
walk('utils')
if (fs.existsSync('index.js')) fs.renameSync('index.js', 'index.ts')

// Step 5: Update package.json
console.log('🛠 Updating package.json...')
const pkgPath = path.join(__dirname, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

pkg.main = 'dist/index.js'
pkg.scripts = {
  ...pkg.scripts,
  build: 'webpack',
  start: 'node dist/index.js'
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
console.log('✅ Updated package.json')

console.log(
  '\n🎉 Conversion complete! Run `npm run build && npm start` to test.\n'
)
