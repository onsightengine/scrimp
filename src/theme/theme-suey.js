import { createTheme } from './create-theme.js';
import { tags as t } from '@lezer/highlight';

const themeSuey = createTheme({
    variant: 'dark',
    settings: {
        background: 'rgba(var(--background-light), 0.5)',
        foreground: 'rgb(var(--icon))',
        caret: 'rgb(var(--icon))',
        selection: 'rgba(var(--complement), 0.25)',
        selectionMatch: 'rgba(var(--triadic1), 0.5)',
        lineHighlight: 'rgba(var(--button-dark), 0.2)',
        gutterBackground: 'rgb(var(--background-light))',
        gutterForeground: 'rgb(var(--text-dark))',
    },
    styles: [
        { tag: t.comment,                           color: 'rgb(var(--text-dark))', },
        { tag: t.variableName,                      color: 'rgb(var(--text-light))', },
        { tag: [ t.string, t.special(t.brace) ],    color: 'rgb(var(--triadic2))', },
        { tag: t.number,                            color: 'rgb(var(--triadic1))', },
        { tag: t.bool,                              color: 'rgb(var(--triadic1))', },
        { tag: t.null,                              color: 'rgb(var(--triadic3))', },
        { tag: t.keyword,                           color: 'rgb(var(--complement))', },
        { tag: t.operator,                          color: 'rgb(var(--triadic6))', },
        { tag: t.className,                         color: 'rgb(var(--icon))', },
        { tag: t.definition(t.typeName),            color: 'rgb(var(--icon))', },
        { tag: t.typeName,                          color: 'rgb(var(--icon))', },
        { tag: t.angleBracket,                      color: 'rgb(var(--text-dark))', },
        { tag: t.tagName,                           color: 'rgb(var(--text-dark))', },
        { tag: t.attributeName,                     color: 'rgb(var(--text-dark))', },
    ],
});

export { themeSuey };
