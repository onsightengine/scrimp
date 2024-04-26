// https://codemirror.net/examples/bundle/
// https://codemirror.net/docs/migration/
// https://unpkg.com/browse/codemirror@6.0.1/dist/index.js
// https://github.com/RPGillespie6/codemirror-quickstart

import { EditorState, StateEffect, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
import { foldGutter, indentOnInput, indentUnit, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, insertTab, indentLess } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap, linter, lintGutter } from '@codemirror/lint';

// Language
import { javascript, esLint } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

// Linter
import * as esb from 'eslint-linter-browserify';

// Theme
// - Editor: https://thememirror.net/create
import { oneDark } from '@codemirror/theme-one-dark';
import { themeSuey } from './theme/theme-suey.js';

// Linter Config
const jsConfig = {
    languageOptions: {
		parserOptions: {
			ecmaVersion: 2023,
			sourceType: "module",
		},
	},
	rules: {
		// semi: [ "error", "never" ],
	},
};

class Scrimp extends EditorView {

    static defaultExtensions() {
        return [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
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
        if (typeof options !== 'object') options = {};
        if (options.initialContents == null) options.initialContents = '';
        if (options.theme == null) options.theme = 'none';
        if (options.tabSize == null) options.tabSize = 4;
        if (options.language == null) options.language = 'javascript';
        if (options.linter == null) options.linter = true;

        // EditorView
        super({ parent });

        // Extensions
        const extensions = Scrimp.defaultExtensions();

        // Compartments
        this.historyCompartment = new Compartment();
        this.languageCompartment = new Compartment();
        this.gutterCompartment = new Compartment();
        this.linterCompartment = new Compartment();

        // History
        extensions.push(this.historyCompartment.of(history()));

        // Language
        if (options.language === 'javascript') {
            extensions.push(this.languageCompartment.of(javascript()));
            if (options.linter) {
                extensions.push(this.gutterCompartment.of(lintGutter()));
                extensions.push(this.linterCompartment.of(linter(esLint(new esb.Linter(), jsConfig))));
            }
        } else if (options.language === 'python') {
            extensions.push(this.languageCompartment.of(python()));
            if (options.linter) {
                extensions.push(this.gutterCompartment.of());
                extensions.push(this.linterCompartment.of());
            }
        } else if (!options.linter) {
            extensions.push(this.gutterCompartment.of());
            extensions.push(this.linterCompartment.of());
        }

        // Theme
        if (options.theme === 'dark') { extensions.push(oneDark); }
        if (options.theme === 'suey') { extensions.push(themeSuey); }

        // Tab Size
        if (options.tabSize) extensions.push(indentUnit.of(" ".repeat(options.tabSize)));

        // State
        const state = EditorState.create({
            doc: options.initialContents,
            extensions,
        });
        this.setState(state);
    }

    /******************** CALLBACK */

    addKeymap(key = '', callback) {
        if (key && key !== '') {
            const newKeymap = keymap.of([ {
                key, // i.e. 'Ctrl-Enter', 'Ctrl-S', etc.
                run: (view) => {
                    if (typeof callback === 'function') callback(view);
                    return true;
                },
            }, ]);
            this.dispatch({ effects: StateEffect.appendConfig.of(newKeymap) });
        }
        return this;
    }

    addUpdate(callback) {
        if (typeof callback === 'function') {
            const newUpdate = EditorView.updateListener.of(callback);
            this.dispatch({ effects: StateEffect.appendConfig.of(newUpdate) });
        }
        return this;
    }

    /******************** CONTENT */

    getContent() {
        return this.state.doc.toString();
    }

    setContent(content, from = 0, to = this.state.doc.length) {
        this.dispatch({ changes: { from, to, insert: content } });
        return this;
    }

    /******************** COMMANDS */

    // https://github.com/codemirror/commands/blob/main/src/commands.ts

    getCursor() {
        return this.state.selection.main.head;
    }

    setCursor(pos) {
        this.dispatch({ selection: { anchor: pos } });
        return this;
    }

    setSelection(from, to) {
        if (Number.isNaN(from) || Number.isNaN(to)) return this;
        this.dispatch({ selection: { anchor: from, head: to } });
        return this;
    }

    selectAll() {
        this.dispatch(this.state.update({ selection: { anchor: 0, head: this.state.doc.length }, userEvent: 'select' }));
        return this;
    }

    /******************** HISTORY */

    clearHistory() {
        this.dispatch({ effects: [ this.historyCompartment.reconfigure([]) ] });
        this.dispatch({ effects: [ this.historyCompartment.reconfigure([ history() ]) ] });
    }

    /******************** LANGUAGE */

    setLanguage(language = 'javascript', includeLinter = true) {
        this.dispatch({ effects: [ this.languageCompartment.reconfigure([]) ] });
        if (language === 'javascript') {
            this.dispatch({ effects: [ this.languageCompartment.reconfigure([ javascript() ]) ] });
            if (includeLinter) {
                this.dispatch({ effects: [ this.gutterCompartment.reconfigure([ lintGutter() ]) ] });
                this.dispatch({ effects: [ this.linterCompartment.reconfigure([ linter(esLint(new esb.Linter(), jsConfig)) ]) ] });
            }
        } else if (language === 'python') {
            this.dispatch({ effects: [ this.languageCompartment.reconfigure([ python() ]) ] });
            if (includeLinter) {
                this.dispatch({ effects: [ this.gutterCompartment.reconfigure([]) ] });
                this.dispatch({ effects: [ this.linterCompartment.reconfigure([]) ] });
            }
        }
    }

}

export { Scrimp };
