import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {INotify} from 'trans-render/lib/types';
import {BeNoticedActions, BeNoticedProps, BeNoticedVirtualProps} from './types';
import {register} from 'be-hive/register.js';

export class BeNoticedController implements BeNoticedActions {
    async intro(proxy: Element & BeNoticedVirtualProps, target: Element, beDecorProps: BeDecoratedProps){
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
        const {notifyHookUp} =  await import('trans-render/lib/notifyHookup.js');
        for(const propKey in params){
            const pram = params[propKey];
            const notifyParam: INotify = (typeof pram === 'string') ? {fn: pram, tocoho: true, nudge: true} : pram;
            await notifyHookUp(target, propKey, notifyParam);
        }
    }

    finale(proxy: Element & BeNoticedVirtualProps, target:Element, beDecorProps: BeDecoratedProps){
        //TODO?
    }
}

export interface BeNoticedController extends BeNoticedProps{}


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
