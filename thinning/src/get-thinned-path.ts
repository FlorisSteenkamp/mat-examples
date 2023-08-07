
import { Mat, CpNode, Loop } from "flo-mat";

import { getMatchingBeziers } from "./get-matching-beziers";
import { toCubic } from "flo-bezier3";


/**
 * Performs linear interpolation between two 2d points and returns the resultant 
 * point.
 * @param p1 The first point.
 * @param p2 The second point.
 * @param t The interpolation fraction in [0,1].
 */
function interpolate(
        p1: number[], 
        p2: number[], 
        t: number) {

    return [
        p1[0] + t*(p2[0] - p1[0]), 
        p1[1] + t*(p2[1] - p1[1])
    ];
}


/**
 * Get interpolated curve between original and thinned boundary.
 * @param cpNode The CpNode representing the medial axis and boundary piece.
 * @param c The thinning factor (from 0 to 1)
 */
function getInterpolatedCurves(cpNode: CpNode, c: number) {
    return getMatchingBeziers(cpNode).map(curve => {
        let boundaryBezier = toCubic(curve.boundaryBezier)
        return [0,1,2,3].map(i =>
            interpolate(
                boundaryBezier[i],
                curve.medialBezier[i], 
                c
            )
        )
    });
}


/**
 * Returns the thinned SVG path string.
 * @param sats Scale axis transforms of the original shape
 * @param c The thinning fraction (from 0 to 1)
 */
function getThinnedPath(sats: Mat[], c: number) {
    // An array of subpaths that will make up the thinned shape - for single 
    // shapes without holes it will only be a single path.
    let pathStrs: string[] = [];

    // Iterate through the scale axis transforms representing the shape - for
    // single shapes without holes there will be only one sat.
    for (let sat of sats) {
        // Start node to iterate from - it also represents the maximum radius 
        // maximal disk.
        let cpStart = sat.cpNode;

        // We map each bezier curve of the thinned path to a specific simple 
        // closed loop - this is so we can have disjoint subpaths representing
        // the shape envelopes and holes. There is probably a simpler way.
        let curvesMap: Map<Loop, number[][][]> = new Map();

        // Iterate through all boundary piece curves
        let cpNode = cpStart;
        do {
            // Get the loop that this boundary piece belongs to
            let loop = cpNode.cp.pointOnShape.curve.loop;

            // Get the map entry holding all curves for the loop
            let curves = curvesMap.get(loop);
            if (!curves) { curves = []; curvesMap.set(loop, curves); }

            // Push the interpolated, i.e. thinned, curves
            curves.push(...getInterpolatedCurves(cpNode, c));

            // Go to next boundary piece
            cpNode = cpNode.next;
        } while (cpNode !== cpStart)


        // Iterate through each set of curves belonging to a specific loop and
        // create a subpath for it.
        curvesMap.forEach(curves => {
            // Add the start point to the subpath
            let p = curves[0][0];
            let pathStartStr = `M ${p[0]} ${p[1]} C`;

            // Add all beziers belonging to the loop to the subpath
            let pathPartStrs = curves.map(c => 
                `${c[1][0]} ${c[1][1]} ${c[2][0]} ${c[2][1]} ${c[3][0]} ${c[3][1]} `
            );

            // Close the subpath
            let pathEndStr = 'z';

            // Add the subpath to the array of subpaths
            pathStrs.push(
                pathStartStr + pathPartStrs.join('') + pathEndStr
            );
        });
    }

    // Join the subpaths into a single SVG path and return it
    return pathStrs.join(" ");
}


export { getThinnedPath }
