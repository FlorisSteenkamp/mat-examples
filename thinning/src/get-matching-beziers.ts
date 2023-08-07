import {
    CpNode, getBoundaryBeziersToNext, getCurveToNext, isTerminating,
    isSharp
} from 'flo-mat';
import { toCubic, fromTo, getTAtLength, totalLength } from 'flo-bezier3';
import { MatchedBeziers } from './matched-beziers';


/**
 * Returns a correspondence between boundary bezier curves and a medial axis
 * bezier curve. They will later be interpolated to perform the thinning.
 * @param cpNode The CpNode representing the scale axis transform 
 * - see the docs http://mat-demo.appspot.com/docs/index.html
 */
function getMatchingBeziers(cpNode: CpNode): MatchedBeziers[] {

    let medialBezier = toCubic(getCurveToNext(cpNode));

    let boundaryBeziers = getBoundaryBeziersToNext(cpNode);
    if (!boundaryBeziers) { return []; }

    // If this is a leaf cpNode we return the boundary piece corresponding to 
    // the leaf untouched.
    if (isTerminating(cpNode)) {
        // If the cpNode represents a sharp corner the boundary is just a point
        // and if it is a hole closer it is a dummy and the boundary does not
        // exist.
        if (isSharp(cpNode) || cpNode.isHoleClosing) { 
            return []; 
        }

        // Map the entire boundary piece to the single medial axis point.
        return boundaryBeziers.map(
            boundaryBezier => ({ boundaryBezier, medialBezier })
        );
    }

    // Get bezier length function from t=0 to t=1.
    //let len = length([0,1]);

    // Filter zero length boundary beziers unless there is only one of them.
    boundaryBeziers = boundaryBeziers.length > 1
        //? boundaryBeziers.filter(len)
        //? boundaryBeziers.filter((ps: number[][]) => length([0,1], ps))
        ? boundaryBeziers.filter(b => totalLength(b))
        : boundaryBeziers

    // If the boundary consists of only one bezier curve then map the single 
    // boundary bezier to the single medial axis bezier.
    if (boundaryBeziers.length === 1) {
        return [{
            boundaryBezier: boundaryBeziers[0],
            medialBezier
        }]
    }
    

    // At this stage multiple boundary beziers corresponds to a single medial
    // axis bezier. We will now split up the medial bezier according to the
    // relative lengths of the boundary beziers. Each split up medial bezier 
    // will be matched to its corresponding boundary bezier.

    // Get length of medial bezier
    let lenMedial = totalLength(medialBezier);
    // Get length of boundary beziers
    let lenBoundaries = boundaryBeziers.map(b => totalLength(b));
    // Get total length of boundary beziers
    let lenBoundaryTotal = lenBoundaries.reduce(
        (sum, length_) => sum + length_, 0
    );

    // Initialize matched bezier array
    let matchedBeziers: MatchedBeziers[] = [];

    // The cumulative boundary piece length
    let cumulativeLength = 0; 

    // The prior t parameter value of the medial bezier up to which a piece 
    // has already been matched
    let priorT = 0; 

    // Create a function that return a piece of the medial bezier between two
    // specified t parameter values.

    // Iterate through all boundary beziers
    for (let i=0; i<boundaryBeziers.length; i++) {
        let lenBoundary = lenBoundaries[i];
        cumulativeLength += lenBoundary;

        // Get the medial bezier t value corresponding to the relative 
        // cumulative length of the boundary up to this point
        let t = getTAtLength(
            medialBezier,
            lenMedial * (cumulativeLength / lenBoundaryTotal)
        );

        // Clamp at 1 due to floating point roundoff - we should not go past 1.
        t = Math.min(t, 1); 

        matchedBeziers.push({
            boundaryBezier: boundaryBeziers[i],
            medialBezier  : fromTo(medialBezier, priorT, t)
        });

        priorT = t;
    }

    return matchedBeziers;
}


export { getMatchingBeziers }
