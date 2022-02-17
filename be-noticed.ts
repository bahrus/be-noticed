import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {INotify, BeNoticedActions, BeNoticedProps, BeNoticedVirtualProps} from './types';
// import {nudge} from 'trans-render/lib/nudge.js';
// import {getHost} from 'trans-render/lib/getHost.js';
// import {convert, getProp, splitExt} from 'on-to-me/prop-mixin.js';
// import {upSearch} from 'trans-render/lib/upSearch.js';
// import {upShadowSearch} from 'trans-render/lib/upShadowSearch.js';
import {register} from 'be-hive/register.js';
// declare function structuredClone(val: any): any;

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
            const pram = params[propKey] as INotify;
            await notifyHookUp(target, propKey, pram);
            
        }
    }

    finale(proxy: Element & BeNoticedVirtualProps, target:Element, beDecorProps: BeDecoratedProps){

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
