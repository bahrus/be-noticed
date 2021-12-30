import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {INotify, BeNoticedActions, BeNoticedProps, BeNoticedVirtualProps} from './types';
import {nudge} from 'trans-render/lib/nudge.js';
import {getHost} from 'trans-render/lib/getHost.js';
import {convert, getProp, splitExt} from 'on-to-me/prop-mixin.js';
import {upSearch} from 'trans-render/lib/upSearch.js';
import {upShadowSearch} from 'trans-render/lib/upShadowSearch.js';
import {structuralClone} from 'trans-render/lib/structuralClone.js';
import {register} from 'be-hive/register.js';

export class BeNoticedController implements BeNoticedActions {
    intro(proxy: Element & BeNoticedVirtualProps, target: Element, beDecorProps: BeDecoratedProps){
        let params: any = undefined;
        const attr = proxy.getAttribute('is-' + beDecorProps.ifWantsToBe!)!;
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
                const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre, tocoho: true} : notifyParamPre;
                notifyParam.propName = propName;
                if(notifyParam.doInit){
                    const recipientElement = getRecipientElement(proxy, notifyParam);
                    if(recipientElement === null){
                        console.warn({msg:'404', notifyParam});
                        continue;
                    }
                    doAction(proxy, recipientElement, notifyParam);
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
                    console.error({ self: proxy, propName, message: "Can't find property." });
                    continue;
                }
                const setter = prop.set!.bind(target);
                const getter = prop.get!.bind(target);
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
                            const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre, tocoho: true} : notifyParamPre;
                            const recipientElement = getRecipientElement(proxy, notifyParam);
                            if(recipientElement === null){
                                console.warn({msg:'404', notifyParam});
                                continue;
                            }
                            doAction(proxy, recipientElement, notifyParam, event as Event);
                        }
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
            const fn = (e: Event) => {
                const pram = params[e.type];
                const notifyParams = Array.isArray(pram) ? pram as INotify[] : [pram] as INotify[];
                for(const notifyParamPre of notifyParams){
                    const notifyParam: INotify = (typeof notifyParamPre === 'string') ? {fn: notifyParamPre, tocoho: true} : notifyParamPre;
                    const recipientElement = getRecipientElement(proxy, notifyParam);
                    if(recipientElement === null){
                        console.warn({msg:'404', notifyParam});
                        continue;
                    }
                    doAction(proxy, recipientElement, notifyParam);
                }
            }
            target.addEventListener(propKey, fn);
            if(proxy.eventHandlers === undefined) proxy.eventHandlers = [];
            const on = propKey as keyof ElementEventMap;
            proxy.eventHandlers.push({on, elementToObserve: target, fn});
            nudge(proxy);
            
        }
    }

    finale(proxy: Element & BeNoticedVirtualProps, target:Element, beDecorProps: BeDecoratedProps){
        const eventHandlers = proxy.eventHandlers;
        for(const eh of eventHandlers){
            eh.elementToObserve.removeEventListener(eh.on, eh.fn);
        }
    }
}

export interface BeNoticedController extends BeNoticedProps{}

//very similar to be-observant.getElementToObserve
function getRecipientElement(self: Element, {toClosest, toNearestUpMatch, toUpShadow: to, toSelf, tocoho}: INotify){
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
        recipientElement = getHost(self, tocoho); 
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
    const split = splitExt(valPath as string);
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
                recipientElement.setAttribute(prop!, val.toString());
                break;
            case 'obj-attr':
                recipientElement.setAttribute(prop!, JSON.stringify(val));
                break;
            case 'bool-attr':
                if(val) {
                    recipientElement.setAttribute(prop!, '');
                }else{
                    recipientElement.removeAttribute(prop!);
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


const tagName = 'be-noticed';

const ifWantsToBe = 'noticed';

const upgrade = '*';

define<BeNoticedProps & BeDecoratedProps<BeNoticedProps, BeNoticedActions>, BeNoticedActions>({
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            noParse: true,
            waitForUpgrade: true,
            intro: 'intro',
            finale: 'finale',
            virtualProps: ['eventHandlers']
        }
    },
    complexPropDefaults: {
        controller: BeNoticedController
    }
});
register(ifWantsToBe, upgrade, tagName);
