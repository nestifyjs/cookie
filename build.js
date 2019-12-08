const { writeFileSync, existsSync, mkdirSync } = require('fs')
const projectPkg = require('./package')
const libraryPkg = require('./src/package')

const { compilerOptions: { outDir: DIST_FOLDER } } = require('./tsconfig')
const EXCLUDE_FIELDS = [ 'scripts', 'devDependencies', 'dependencies' ]

EXCLUDE_FIELDS.forEach(field => delete projectPkg[field])

const pkg = Object.assign({}, projectPkg, libraryPkg)

if (!existsSync(DIST_FOLDER)) {
  mkdirSync(DIST_FOLDER)
}

writeFileSync(`${ DIST_FOLDER }/package.json`, JSON.stringify(pkg, null, 2))
