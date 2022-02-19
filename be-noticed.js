import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
export class BeNoticedController {
    async intro(proxy, target, beDecorProps) {
        let params = undefined;
        const attr = proxy.getAttribute('is-' + beDecorProps.ifWantsToBe);
        try {
            params = JSON.parse(attr);
        }
        catch (e) {
            console.error({
                e,
                attr
            });
            return;
        }
        const { notifyHookUp } = await import('trans-render/lib/notifyHookup.js');
        for (const propKey in params) {
            const pram = params[propKey];
            const notifyParam = (typeof pram === 'string') ? { fn: pram, tocoho: true } : pram;
            await notifyHookUp(target, propKey, notifyParam);
        }
    }
    finale(proxy, target, beDecorProps) {
        //TODO?
    }
}
const tagName = 'be-noticed';
const ifWantsToBe = 'noticed';
const upgrade = '*';
define({
    config: {
        tagName,
        propDefaults: {
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
