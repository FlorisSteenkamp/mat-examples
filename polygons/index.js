"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flo_mat_1 = require("flo-mat");
const NS = 'http://www.w3.org/2000/svg'; // Svg namespace
/**
 * Creates and returns an SVG DOM element.
 * @param id The dom id to assign to the SVG element, e.g. 1 -> 'svg-1'
 */
function createSvg(id) {
    let $e = document.createElementNS(NS, 'svg');
    $e.setAttributeNS(null, 'id', 'svg' + id);
    $e.setAttributeNS(null, 'style', 'width: 25%; display: inline-block');
    $e.setAttributeNS(null, 'viewBox', '0 0 100 100');
    return $e;
}
/**
 * Returns an SVG path string of a regular polygon with n sides.
 * @param n The number of sides.
 * @param c The center of the circumscribed circle.
 * @param r The radius.
 */
function drawRegularPolygon(n, c, r) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
        let θ = i * 2 * Math.PI / n;
        vertices.push([c[0] + r * Math.sin(θ), c[1] + r * Math.cos(θ)]);
    }
    let pathStr = '';
    let prefix = 'M';
    for (let vertex of vertices) {
        pathStr += `${prefix}${vertex[0]} ${vertex[1]} \n`;
        prefix = 'L';
    }
    pathStr += 'z';
    return pathStr;
}
/**
 * Returns an SVG path string of a line.
 * @param ps The line endpoints.
 */
function drawLine(ps) {
    let [[x0, y0], [x1, y1]] = ps;
    return `M${x0} ${y0} L${x1} ${y1}`;
}
/**
 * Returns an SVG path string of a quadratic bezier curve.
 * @param ps The quadratic bezier control points.
 */
function drawQuadBezier(ps) {
    let [[x0, y0], [x1, y1], [x2, y2]] = ps;
    return `M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2}`;
}
/**
 * Returns an SVG path string of a cubic bezier curve.
 * @param ps The cubic bezier control points.
 */
function drawCubicBezier(ps) {
    let [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = ps;
    return `M${x0} ${y0} C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
}
/**
 * Returns a function that draws an array of MAT curves on an SVG element.
 * @param mats An array of MATs to draw.
 * @param svg The SVG element on which to draw.
 * @param type The type of MAT to draw. This simply affects the class on the
 * path element.
  */
function drawMats(mats, svg, type = 'mat') {
    mats.forEach(f);
    /**
     * Draws a MAT curve on an SVG element.
     */
    function f(mat) {
        let cpNode = mat.cpNode;
        if (!cpNode) {
            return;
        }
        let fs = [, , drawLine, drawQuadBezier, drawCubicBezier];
        flo_mat_1.traverseEdges(cpNode, function (cpNode) {
            if (cpNode.isTerminating()) {
                return;
            }
            let bezier = cpNode.matCurve;
            if (!bezier) {
                return;
            }
            let $path = document.createElementNS(NS, 'path');
            $path.setAttributeNS(null, "d", fs[bezier.length](bezier));
            $path.setAttributeNS(null, "class", type);
            svg.appendChild($path);
        });
    }
}
for (let i = 3; i < 11; i++) {
    let $svg = createSvg(1); // Create SVG element.
    let $path = document.createElementNS(NS, 'path'); // Create SVG path elem.
    $path.setAttribute('class', 'shape-path');
    $svg.appendChild($path); // Add the path element to the SVG.
    document.body.appendChild($svg); // Add the SVG to the document body.
    // Create polygon path with i vertices.
    let $d = drawRegularPolygon(i, [50, 50], 45);
    // Assign the path to the path element.
    $path.setAttributeNS(null, "d", $d);
    // Get loops (representing the shape) from the path.
    let loops = flo_mat_1.Svg.getPathsFromStr($d);
    /*
    let loops = [new Loop([
        [50, 95],
        [92.797, 63.905],
        [76.450, 13.594],
        [23.549, 13.594],
        [7.202, 63.90]
    ]);
    */
    // Get MATs from the loops.
    let mats = flo_mat_1.findMats(loops);
    // Draw the MATs.
    drawMats(mats, $svg);
}
