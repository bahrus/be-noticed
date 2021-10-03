import { XtalDecor } from 'xtal-decor/xtal-decor.js';
import { CE } from 'trans-render/lib/CE.js';
import { convert, getProp, splitExt } from 'on-to-me/prop-mixin.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { upSearch } from 'trans-render/lib/upSearch.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
const ce = new CE({
    config: {
        tagName: 'be-noticed',
        propDefaults: {
            upgrade: '*',
            ifWantsToBe: 'noticed',
            noParse: true,
            forceVisible: true,
            virtualProps: ['recipientElement'],
        }
    },
    complexPropDefaults: {
        actions: [],
        on: {},
        init: (self, decor) => {
            const params = JSON.parse(self.getAttribute('is-' + decor.ifWantsToBe));
            for (const propKey in params) {
                const pram = params[propKey];
                const notifyParams = Array.isArray(pram) ? pram : [pram];
                for (const notifyParam of notifyParams) {
                    if (notifyParam.doInit) {
                        const recipientElement = getRecipientElement(self, notifyParam);
                        if (recipientElement === null) {
                            console.warn({ msg: '404', notifyParam });
                            continue;
                        }
                        doAction(self, recipientElement, notifyParam);
                    }
                }
                self.addEventListener(propKey, e => {
                    const pram = params[e.type];
                    const notifyParams = Array.isArray(pram) ? pram : [pram];
                    for (const notifyParam of notifyParams) {
                        const recipientElement = getRecipientElement(self, notifyParam);
                        if (recipientElement === null) {
                            console.warn({ msg: '404', notifyParam });
                            continue;
                        }
                        doAction(self, recipientElement, notifyParam);
                    }
                });
                nudge(self);
            }
        }
    },
    superclass: XtalDecor,
});
//very similar to be-observant.getElementToObserve
function getRecipientElement(self, { toHost, toClosest, toNearestUpMatch, to }) {
    let recipientElement = self.recipientElement;
    if (recipientElement)
        return recipientElement;
    if (toHost) {
        recipientElement = getHost(self);
    }
    else if (to) {
        recipientElement = upShadowSearch(self, to);
    }
    else if (toClosest !== undefined) {
        recipientElement = self.closest(toClosest);
        if (recipientElement !== null && toNearestUpMatch) {
            recipientElement = upSearch(recipientElement, toNearestUpMatch);
        }
    }
    else if (toNearestUpMatch !== undefined) {
        recipientElement = upSearch(self, toNearestUpMatch);
    }
    else {
        throw 'NI'; //not implemented
    }
    self.recipientElement = recipientElement;
    return recipientElement;
}
//very similar to be-observant.set
function doAction(self, recipientElement, { valFromEvent, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop, fn, toggleProp, plusEq, withArgs }, event) {
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if (event === undefined && valFE !== undefined)
        return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || "value";
    const split = splitExt(valPath);
    let src = valFE !== undefined ? (event ? event : self) : self;
    let val = getProp(src, split, self);
    if (val === undefined)
        return;
    if (clone)
        val = structuralClone(val);
    if (parseValAs !== undefined) {
        val = convert(val, parseValAs);
    }
    if (trueVal && val) {
        val = trueVal;
    }
    else if (falseVal && !val) {
        val = falseVal;
    }
    if (as !== undefined) {
        //const propKeyLispCase = camelToLisp(propKey);
        switch (as) {
            case 'str-attr':
                recipientElement.setAttribute(prop, val.toString());
                break;
            case 'obj-attr':
                recipientElement.setAttribute(prop, JSON.stringify(val));
                break;
            case 'bool-attr':
                if (val) {
                    recipientElement.setAttribute(prop, '');
                }
                else {
                    recipientElement.removeAttribute(prop);
                }
                break;
            // default:
            //     if(toProp === '...'){
            //         Object.assign(subMatch, val);
            //     }else{
            //         (<any>subMatch)[toProp] = val;
            //     }
        }
    }
    else {
        if (prop !== undefined) {
            doSet(recipientElement, prop, val, plusEq, toggleProp);
        }
        else if (fn !== undefined) {
            doInvoke(recipientElement, fn, val, withArgs, event);
        }
        else {
            throw 'NI'; //Not Implemented
        }
    }
}
//duplicated with be-observant
function getHost(self) {
    let host = self.getRootNode().host;
    if (host === undefined) {
        host = self.parentElement;
        while (host && !host.localName.includes('-')) {
            host = host.parentElement;
        }
    }
    return host;
}
//copied from pass-up initially
function doSet(recipientElement, prop, val, plusEq, toggleProp) {
    if (plusEq) {
        recipientElement[prop] += val;
    }
    else if (toggleProp) {
        recipientElement[prop] = !recipientElement[prop];
    }
    else {
        recipientElement[prop] = val;
    }
}
//copied from pass-up initially
function doInvoke(match, fn, val, withArgs, event) {
    const args = [];
    const copyArgs = withArgs || ['self', 'val', 'event'];
    for (const arg of copyArgs) {
        switch (arg) {
            case 'self':
                args.push(match);
                break;
            case 'val':
                args.push(val);
                break;
            case 'event':
                args.push(event);
                break;
        }
    }
    match[fn](...args);
}
/**
* Decrement "disabled" counter, remove when reaches 0
* @param prevSib
*/
function nudge(prevSib) {
    const da = prevSib.getAttribute('disabled');
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            prevSib.removeAttribute('disabled');
            prevSib.disabled = false;
        }
        else {
            prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
        }
    }
}
// /**
// * get previous sibling -- identical to be-observant
// */
// function getPreviousSib(self: Element, observe: string) : Element | null{
//     let prevSib: Element | null = self;
//     while(prevSib && !prevSib.matches(observe)){
//         const nextPrevSib: Element | null = prevSib.previousElementSibling || prevSib.parentElement;
//         prevSib = nextPrevSib;
//     }
//     return prevSib;
//  }
document.head.appendChild(document.createElement('be-noticed'));
