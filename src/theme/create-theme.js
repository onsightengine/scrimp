// https://github.com/vadimdemedes/thememirror/blob/main/source/create-theme.ts

import { EditorView } from '@codemirror/view';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';

const createTheme = ({ variant, settings, styles }) => {
    const theme = EditorView.theme({
        '&': {
            backgroundColor: settings.background,
            color: settings.foreground,
        },
        '.cm-content': {
            caretColor: settings.caret,
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: settings.caret,
        },
        '&.cm-focused .cm-selectionBackgroundm .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: settings.selection,
        },
        '.cm-selectionMatch': {
            backgroundColor: settings.selectionMatch,
        },
        '.cm-activeLine': {
            backgroundColor: settings.lineHighlight,
        },
        '.cm-gutters': {
            backgroundColor: settings.gutterBackground,
            color: settings.gutterForeground,
        },
        '.cm-activeLineGutter': {
            backgroundColor: settings.lineHighlight,
        },
    }, {
        dark: variant === 'dark',
    });

    const highlightStyle = HighlightStyle.define(styles);
    const extension = [ theme, syntaxHighlighting(highlightStyle) ];
    return extension;
};

export { createTheme };
