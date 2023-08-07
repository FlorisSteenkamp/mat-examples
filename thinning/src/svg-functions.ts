
// SVG namespace
const XMLNS = 'http://www.w3.org/2000/svg'; 


/**
 * Adds a path to the given SVG element and give it a shape-path class.
 */
function addPath(
        $elem: SVGElement, 
        pathStr: string,
        class_: string) {

    // Create SVG path elem.
    let $path = document.createElementNS(XMLNS, 'path'); 
    $path.setAttribute('class', class_); 
    $elem.appendChild($path); // Add the path element to the SVG.
    $path.setAttribute('d', pathStr); 

    return $path;
}


export { addPath }
