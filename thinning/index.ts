
// This demo contrasts thinning done via a scale axis transform method and
// thinning (also called erosion) done by the standard built-in morphology SVG 
// filter.
//
// The medial and scale axis transform libraries can be found on GitHub 
// here https://github.com/FlorisSteenkamp/MAT.
// The demo is also available on GitHub under the examples at
// https://github.com/FlorisSteenkamp/mat-examples

import { findMats, getPathsFromStr, Mat, toScaleAxis } from 'flo-mat';

import { addPath } from './src/svg-functions';
import { getThinnedPath } from './src/get-thinned-path';
import { getPathStrs } from './src/get-path-strs';
import { createSelectOptions } from './src/create-select-options';


(function() {
    // Get the path strings for the letter glyphs.
    const SVG_PATH_STRS = getPathStrs();

    // Get a handle on some SVG elements from the DOM.
    let $svg: SVGSVGElement = (document.getElementById('svg')) as any;
    let $svgErode: SVGSVGElement = (document.getElementById('svg-erode')) as any;
    let $gErode: SVGGElement = (document.getElementById('g-erode')) as any;

    // Get / create some more html elements
    let $shapeSelect = document.getElementById('shape-select');
    let $thinSlider  = document.getElementById('thin-slider');
    let $erodeSlider = document.getElementById('erode-slider');
    createSelectOptions($shapeSelect, SVG_PATH_STRS);

    // Our path objects
    let $shapeThinOutline: SVGPathElement;    
    let $shapeThin: SVGPathElement;
    let $shapeErodeOutline: SVGPathElement;
    let $shapeErode: SVGPathElement;

    // The medial axis transforms
    let mats: Mat[];
    let sats: Mat[] = [];

    // The scale axis transform parameter
    let s = 2.5;

    // The letter shape at its thickest
    let thickestWidth: number;

    // Set slider and select change events
    $shapeSelect.onchange = onShapeChanged;
    $thinSlider.oninput = onThinPercentChanged;
    $erodeSlider.oninput = erodeSliderChanged;
    

    onShapeChanged();


    /**
     * Called when initially and when a different letter was selected
     */
    function onShapeChanged() {
        // Remove prior SVGs
        if ($shapeThinOutline) { $shapeThinOutline.remove(); }
        if ($shapeThin) { $shapeThin.remove(); }        
        if ($shapeErodeOutline) { $shapeErodeOutline.remove(); }
        if ($shapeErode) { $shapeErode.remove(); }

        // Get new SVG path according to user selection
        let svgPathStr = SVG_PATH_STRS[
            ($shapeSelect as HTMLSelectElement).value
        ];

        // Get the array of bezier loops from the SVG path string
        let bezierLoops = getPathsFromStr(svgPathStr);

        // Get their medial axis transforms
        mats = findMats(bezierLoops, 10);

        // Get their scale axis transforms
        sats = mats.map(mat => toScaleAxis(mat, s));

        // Get new thickest width
        thickestWidth = 0;
        sats.forEach(sat => {
            let r = sat.cpNode.cp.circle.radius;
            if (r > thickestWidth) { thickestWidth = r; }
        });


        // Add new SVG paths
        $shapeThinOutline = addPath($svg, svgPathStr, 'shape-path');
        $shapeErodeOutline = addPath($svgErode, svgPathStr, 'shape-path');
        $shapeErode = addPath($gErode, svgPathStr, 'shape-path-erode');

        // Update viewboxes to fit letters to display
        let bb = $svg.getBBox();
        let viewBox = `${bb.x} ${bb.y} ${bb.width} ${bb.height}`;
        $svg.setAttributeNS(null, 'viewBox', viewBox);
        $svgErode.setAttributeNS(null, 'viewBox', viewBox);
        
        onThinPercentChanged();
        erodeSliderChanged();
    }


    /**
     * Fires when the thinning percentage changed via the slider
     */
    function onThinPercentChanged() {
        // Remove old thin path
        if ($shapeThin) { $shapeThin.remove(); }

        // Get new thin fraction
        let thinFraction = (($thinSlider as any).value) / 100;

        // Get new path string
        let pathStr = getThinnedPath(sats, thinFraction);

        // Update SVG path
        $shapeThin = addPath($svg, pathStr, 'thin');
    }


    function erodeSliderChanged() {
        // Get erosion fraction
        let erodeFraction = ($erodeSlider as any).value / 100;
        // Get erosion radius
        let erodeRadius = thickestWidth * erodeFraction;

        // Update SVG morphology filter erosion radius
        let $feErode = document.getElementById('fe-erode');
        $feErode.setAttributeNS(null, 'radius', erodeRadius.toString())
    }
})();
