import {XtalDecor, XtalDecorCore} from 'xtal-decor/xtal-decor.js';
import { XtalDecorProps } from 'xtal-decor/types';
import {CE} from 'trans-render/lib/CE.js';
import { camelToLisp } from 'trans-render/lib/camelToLisp.js';
import {INotify} from './types';
import {convert, getProp, splitExt} from 'on-to-me/prop-mixin.js';
import {structuralClone} from 'trans-render/lib/structuralClone.js';
import {upSearch} from 'trans-render/lib/upSearch.js';
import {upShadowSearch} from 'trans-render/lib/upShadowSearch.js';


const ce = new CE<XtalDecorCore<Element>>({
    config:{
        tagName: 'be-noticed',
        propDefaults:{
            upgrade: '*',
            ifWantsToBe: 'noticed',
            noParse: true,
            forceVisible: true,
            virtualProps: ['recipientElement'],
        }
    },
    complexPropDefaults:{
        actions:[],
        on:{},
        init: (self: Element, decor: XtalDecorProps<Element>, target) => {
            let params: any = undefined;
            const attr = self.getAttribute('is-' + decor.ifWantsToBe!)!;
            try{
                params = JSON.parse(attr);
            }catch(e){
                console.error({
                    e,
                    attr
                });
                return;
            }
            for(const propKey in params){
                const pram = params[propKey];
                const isPropSet = propKey.endsWith(':onSet');
                const propName = isPropSet ?  propKey.substr(0, propKey.length - 6) : undefined;
                const notifyParams = Array.isArray(pram) ? pram as INotify[] : [pram] as (string | INotify)[];
                for(const notifyParamPre of notifyParams){
                    const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre} : notifyParamPre;
                    notifyParam.propName = propName;
                    if(notifyParam.doInit){
                        const recipientElement = getRecipientElement(self, notifyParam);
                        if(recipientElement === null){
                            console.warn({msg:'404', notifyParam});
                            continue;
                        }
                        doAction(self, recipientElement, notifyParam);
                    }
                }
                if(propName !== undefined){
                    let proto = target;
                    let prop = Object.getOwnPropertyDescriptor(proto, propName);
                    while (proto && !prop) {
                        proto = Object.getPrototypeOf(proto);
                        prop = Object.getOwnPropertyDescriptor(proto, propName);
                    }
                    if (prop === undefined) {
                        console.error({ self, propName, message: "Can't find property." });
                        continue;
                    }
                    const setter = prop.set!.bind(self);
                    const getter = prop.get!.bind(self);
                    Object.defineProperty(target, propName, {
                        get() {
                            return getter();
                        },
                        set(nv) {
                            setter(nv);
                            const event = {
                                target: this
                            };
                            const pram = params[propName + ":onSet"];
                            const notifyParams = Array.isArray(pram) ? pram as INotify[] : [pram] as INotify[];
                            for(const notifyParamPre of notifyParams){
                                const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre} : notifyParamPre;
                                const recipientElement = getRecipientElement(self, notifyParam);
                                if(recipientElement === null){
                                    console.warn({msg:'404', notifyParam});
                                    continue;
                                }
                                doAction(self, recipientElement, notifyParam);
                            }
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
                self.addEventListener(propKey, e => {
                    const pram = params[e.type];
                    const notifyParams = Array.isArray(pram) ? pram as INotify[] : [pram] as INotify[];
                    for(const notifyParamPre of notifyParams){
                        const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre} : notifyParamPre;
                        const recipientElement = getRecipientElement(self, notifyParam);
                        if(recipientElement === null){
                            console.warn({msg:'404', notifyParam});
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
function getRecipientElement(self: Element, {toClosest, toNearestUpMatch, toUpShadow: to, toSelf}: INotify){
    let recipientElement: Element | null = (<any>self).recipientElement;
    if(recipientElement) return recipientElement;
    if(to){
        recipientElement = upShadowSearch(self, to);
    }else if(toClosest !== undefined){
        recipientElement = self.closest(toClosest);
        if(recipientElement !== null && toNearestUpMatch){
            recipientElement = upSearch(recipientElement, toNearestUpMatch) as Element;
        }
    }else if(toNearestUpMatch !== undefined) {
        recipientElement = upSearch(self, toNearestUpMatch) as Element;
    }else if(toSelf){
        recipientElement = self;
    }else{
        recipientElement = getHost(self); //not implemented
    }
    (<any>self).recipientElement = recipientElement;
    return recipientElement;
}

//very similar to be-observant.set
function doAction(self: Element, recipientElement: Element, {
    valFromEvent, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop, fn, toggleProp, plusEq, withArgs, propName
}: INotify, event?: Event){
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if(event === undefined && valFE !== undefined) return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
    const split = splitExt(valPath);
    let src: any = valFE !== undefined ? ( event ? event : self) : self; 
    let val = getProp(src, split, self);
    if(val === undefined) return;
    if(clone) val = structuralClone(val);
    if(parseValAs !== undefined){
        val = convert(val, parseValAs);
    }
    if(trueVal && val){
        val = trueVal;
    }else if(falseVal && !val){
        val = falseVal;
    }
    if(as !== undefined){
        //const propKeyLispCase = camelToLisp(propKey);
        switch(as){
            case 'str-attr':
                recipientElement.setAttribute(prop, val.toString());
                break;
            case 'obj-attr':
                recipientElement.setAttribute(prop, JSON.stringify(val));
                break;
            case 'bool-attr':
                if(val) {
                    recipientElement.setAttribute(prop, '');
                }else{
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
    }else{
        if(prop !== undefined){
            doSet(recipientElement, prop, val, plusEq, toggleProp)
        }else if(fn !== undefined){
            doInvoke(recipientElement, fn, val, withArgs, event);
        }else{
            throw 'NI'; //Not Implemented
        }
        
    }
}

//duplicated with be-observant
function getHost(self:Element): HTMLElement{
    let host = (<any>self.getRootNode()).host;
    if(host === undefined){
        host = self.parentElement;
        while(host && !host.localName.includes('-')){
            host = host.parentElement;
        }
    }
    return host;
}

//copied from pass-up initially
function doSet(recipientElement: any, prop: string, val: any, plusEq: boolean | undefined, toggleProp: boolean | undefined){
    if(plusEq){
        recipientElement[prop] += val;
    }else if(toggleProp){
        recipientElement[prop] = !recipientElement[prop];
    }else{
        recipientElement[prop] = val;
    }
    
}

//copied from pass-up initially
function doInvoke(match: any, fn: string, val: any, withArgs: string[] | undefined, event?: Event){
    const args = [];
    const copyArgs = withArgs || ['self', 'val', 'event'];
    for(const arg of copyArgs){
        switch(arg){
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
  function nudge(prevSib: Element) { //TODO:  Share with be-observant
    const da = prevSib.getAttribute('disabled');
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            prevSib.removeAttribute('disabled');
            (<any>prevSib).disabled = false;
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