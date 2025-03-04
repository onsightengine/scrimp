import cleanup from 'rollup-plugin-cleanup';                // Remove comments, supports sourcemap
import postcss from 'rollup-plugin-postcss';                // Include CSS
import json from '@rollup/plugin-json';                     // Import JSON
import terser from '@rollup/plugin-terser';                 // Remove comments, minify
import { nodeResolve } from "@rollup/plugin-node-resolve";  // Resolver

import pkg from './package.json' with { type: "json" };

function header() {
    return {
        renderChunk(code) {
            return `/**
 * @description Scrimp
 * @about       Customized CodeMirror 6 editor for use with the Onsight Editor.
 * @author      Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/onsightengine/scrimp
 * @version     v${pkg.version}
 */
${code}`;
        }
    };
}

const builds = [

    { // Standard
        input: './src/Scrimp.js',
        treeshake: false,

        plugins: [
            nodeResolve(),
            cleanup({
                comments: 'none',
                extensions: [ 'js', 'ts' ],
                sourcemap: false,
            }),
            json(),
            postcss({
                extensions: [ '.css' ],
            }),
        ],

        output: [{
            format: 'esm',
            file: './dist/scrimp.module.js',
            sourcemap: false,
            plugins: [
                header(),
            ],
        }],
    },

    // { // Minified
    //     input: './src/Scrimp.js',
    //     treeshake: false,

    //     plugins: [
    //         nodeResolve(),
    //         json(),
    //         postcss({
    //             extensions: [ '.css' ],
    //         }),
    //     ],

    //     output: [{
    //         format: 'esm',
    //         file: './dist/scrimp.min.js',
    //         sourcemap: false,
    //         plugins: [
    //             terser({ format: { comments: false } }),
    //             header(),
    //         ],
    //     }],
    // },

];

export default builds;
