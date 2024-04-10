// https://codemirror.net/examples/bundle/
// https://codemirror.net/docs/migration/
// https://unpkg.com/browse/codemirror@6.0.1/dist/index.js
// https://github.com/RPGillespie6/codemirror-quickstart

import { EditorState, StateEffect, Compartment } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
import { foldGutter, indentOnInput, indentUnit, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, insertTab, indentLess } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap, linter, lintGutter } from '@codemirror/lint';

// Language
import { javascript } from "@codemirror/lang-javascript";

// Theme
// - Editor: https://thememirror.net/create
import { oneDark } from "@codemirror/theme-one-dark";
import { themeSuey } from './theme/theme-suey.js';

// // Linter (find errors)
// import esprima from 'esprima'; // v4.0.1 https://github.com/jquery/esprima
//
// const esprimaLinter = linter(view => {
//     const diagnostics = [];
//     const code = view.state.doc.toString();
//     try {
//         esprima.parse(code, { tolerant: true, loc: true });
//     } catch (error) {
//         if (error instanceof SyntaxError) {
//             const diagnostic = {
//             from: view.state.doc.line(error.lineNumber - 1).from + error.column - 1,
//             to: view.state.doc.line(error.lineNumber - 1).to,
//             message: error.description,
//             severity: 'error',
//             };
//             diagnostics.push(diagnostic);
//         }
//     }
//     return diagnostics;
// });

class Scrimp extends EditorView {

    static defaultExtensions() {
        return [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            // drawSelection(), //NOTE: Don't want, allows browser to draw native selection color
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap,
                { key: 'Tab', preventDefault: true, run: insertTab },
                { key: 'Shift-Tab', preventDefault: true, run: indentLess },
            ]),
        ];
    }

    constructor(parent, options = {}) {
        if (options.initialContents == null) options.initialContents = '';
        if (options.theme == null) options.theme = 'none';
        if (options.tabSize == null) options.tabSize = 4;
        if (options.language == null) options.language = [ 'javascript' ];
        if (options.linter == null) options.linter = true;

        // EditorView
        super({ parent });

        // Extensions
        const extensions = Scrimp.defaultExtensions();

        // Options
        let linterCount = 0;
        if (options) {
            if (options.theme) {
                if (options.theme === 'dark') { extensions.push(oneDark); }
                if (options.theme === 'suey') { extensions.push(themeSuey); }
            }
            if (options.tabSize) extensions.push(indentUnit.of(" ".repeat(options.tabSize)));
            if (Array.isArray(options.language)) {
                for (const lang of options.language) {
                    if (lang === 'javascript') {
                        extensions.push(javascript());
                        // if (options.linter) extensions.push(esprimaLinter);
                    }
                }
            }
        }
        if (linterCount > 0) extensions.push(lintGutter());

        // State
        const state = EditorState.create({
            doc: options.initialContents,
            extensions,
        });
        this.setState(state);
    }

    /******************** CALLBACK */

    addKeymap(key = '', callback) {
        const newKeymap = keymap.of([
            {
                key, // i.e. 'Ctrl-Enter', 'Ctrl-S', etc.
                run: (view) => {
                    if (typeof callback === 'function') callback(view);
                    return true;
                },
            },
        ]);
        this.dispatch({ effects: StateEffect.appendConfig.of(newKeymap) });
    }

    /******************** CONTENT */

    getContent() {
        return this.state.doc.toString();
    }

    setContent(content, from = 0, to = this.state.doc.length) {
        this.dispatch({ changes: { from, to, insert: content } });
    }

    /******************** COMMANDS */

    // https://github.com/codemirror/commands/blob/main/src/commands.ts

    selectAll() {
        const state = this.viewState.state;
        this.dispatch(state.update({ selection: {anchor: 0, head: state.doc.length}, userEvent: "select" }));
    }

}

export { Scrimp };
