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
                        setProp(self, recipientElement, notifyParam);
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
                        setProp(self, recipientElement, notifyParam);
                    }
                });
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
function setProp(self, recipientElement, { valFromEvent, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop }, event) {
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if (event === undefined && valFE !== undefined)
        return;
    const valPath = event !== undefined && valFE ? valFE : valFT;
    if (valPath === undefined)
        throw 'NI'; //not implemented;
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
                self.setAttribute(prop, val.toString());
                break;
            case 'obj-attr':
                self.setAttribute(prop, JSON.stringify(val));
                break;
            case 'bool-attr':
                if (val) {
                    self.setAttribute(prop, '');
                }
                else {
                    self.removeAttribute(prop);
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
        self[prop] = val;
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
