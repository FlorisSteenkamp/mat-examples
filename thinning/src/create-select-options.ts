
/**
 * Creates HTML select elements for the letters.
 */
function createSelectOptions(
        $select: HTMLElement,
        svgPathStrs: { [key: string]: string }) {

    for (let key of Object.keys(svgPathStrs)) {
        let $option = document.createElement('option');
        $option.setAttribute('value', key);
        $option.innerHTML = '--- ' + key + ' ---';

        $select.append($option);
    }
}


export { createSelectOptions }
