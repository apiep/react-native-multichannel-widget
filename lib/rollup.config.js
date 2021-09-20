// @ts-check

import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import sourceMaps from 'rollup-plugin-sourcemaps'
import pkg from '../package.json'

const packageName = 'react-native-multichannel-widget'

const config = {
  input: 'index.js',
  output: {
    file: `dist/${packageName}.js`,
    format: 'cjs',
    exports: 'named',
  },
  plugins: [
    sourceMaps(),
    json(),
    nodeResolve(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    typescript({ tsconfig: 'tsconfig.json' }),
    commonjs({
      exclude: 'node_modules/**',
    }),
    replace({
      preventAssignment: true,
      values: {
        __VERSION__: JSON.stringify(pkg.version),
      },
    }),
    terser(),
  ],
  external: [/node_modules/],
}

export default config
