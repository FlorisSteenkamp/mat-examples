
/**
 * Get the SVG path strings from all the glyph elements in the document.
 */
function getPathStrs() {
    let $paths = Array.from(document.getElementsByTagName('glyph'));
    let pathStrs: { [key: string]: string } = {}
    for (let $path of $paths) {
        let d    = $path.getAttribute('d');
        let char = $path.getAttribute('unicode');
        pathStrs[char] = d;
    }

    return pathStrs;
}


export { getPathStrs }
