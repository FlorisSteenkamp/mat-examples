
/**
 * A type representing a correspondence between two bezier curves (one on the
 * boundary and one on the medial axis)
 */
type MatchedBeziers = {
    boundaryBezier: number[][];
    medialBezier  : number[][];
}


export { MatchedBeziers }
