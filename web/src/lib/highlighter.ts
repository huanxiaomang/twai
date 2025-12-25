import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;
let promise: Promise<Highlighter> | null = null;

export async function getHighlighter() {
    if (highlighter) return highlighter;
    if (promise) return promise;

    promise = createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: ["javascript", "typescript", "vue", "css", "html", "json", "bash", "markdown"],
    }).then((hl) => {
        highlighter = hl;
        return hl;
    });

    return promise;
}
