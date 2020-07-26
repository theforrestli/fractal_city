'use strict'

const browserify = require('browserify')
const tsify = require('tsify')
const babelify = require('babelify')

browserify('./src/main.ts')
  .plugin(tsify)
  .transform(babelify, {extensions: ['.ts', '.js'] })
  .bundle()
  .pipe(process.stdout)
