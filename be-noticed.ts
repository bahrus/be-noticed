import {define, BeDecoratedProps} from 'be-decorated/DE.js';
import {INotify} from 'trans-render/lib/types';
import {Actions, BeNoticedProps, VirtualProps} from './types';
import {register} from 'be-hive/register.js';

export class BeNoticed extends EventTarget implements Actions {
    #controllers: AbortController[] | undefined;
    async intro(proxy: Element & VirtualProps, target: Element, beDecorProps: BeDecoratedProps){
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
        const {notifyHookup} =  await import('trans-render/lib/notifyHookup.js');
        this.#controllers = [];
        for(const propKey in params){
            const pram = params[propKey];
            const notifyParam: INotify = (typeof pram === 'string') ? {fn: pram, tocoho: true, nudge: true} : pram;
            const handler = await notifyHookup(target, propKey, notifyParam);
            this.#controllers.push(handler.controller);
        }
        proxy.resolved = true;
    }

    disconnect(){
        if(this.#controllers === undefined) return;
        for(const c of this.#controllers){
            c.abort();
        }
    }

    async finale(proxy: Element & VirtualProps, target:Element, beDecorProps: BeDecoratedProps){
       this.disconnect();
    }
}

export interface BeNoticed extends BeNoticedProps{}


const tagName = 'be-noticed';

const ifWantsToBe = 'noticed';

const upgrade = '*';

define<BeNoticedProps & BeDecoratedProps<BeNoticedProps, Actions>, Actions>({
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            noParse: true,
            intro: 'intro',
            finale: 'finale',
            virtualProps: []
        }
    },
    complexPropDefaults: {
        controller: BeNoticed
    }
});
register(ifWantsToBe, upgrade, tagName);
