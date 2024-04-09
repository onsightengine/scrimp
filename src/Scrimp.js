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
import { lintKeymap } from '@codemirror/lint';
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

class Scrimp extends EditorView {

    static defaultExtensions() {
        return [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
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

    constructor(parent, initialContents = '', options = { dark: true, tabSize: 4, language: [ 'javascript' ] }) {
        // EditorView
        super({ parent });

        // Extensions
        const extensions = Scrimp.defaultExtensions();

        // Options
        if (options) {
            if (options.dark) extensions.push(oneDark);
            if (options.tabSize) extensions.push(indentUnit.of(" ".repeat(options.tabSize)));
            if (Array.isArray(options.language)) {
                for (const lang of options.language) {
                    if (lang === 'javascript') extensions.push(javascript());
                }
            }
        }

        // State
        const state = EditorState.create({
            doc: initialContents,
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

}

export { Scrimp };
