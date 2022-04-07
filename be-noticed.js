import { define } from 'be-decorated/be-decorated.js';
import { doParse } from 'be-decorated/doParse.js';
import { register } from 'be-hive/register.js';
export class BeNoticedController {
    #eventHandlers = {};
    async intro(proxy, target, beDecorProps) {
        const params = doParse(target, beDecorProps);
        const { notifyHookup } = await import('trans-render/lib/notifyHookup.js');
        for (const propKey in params) {
            const pram = params[propKey];
            const notifyParam = (typeof pram === 'string') ? { fn: pram, tocoho: true, nudge: true } : pram;
            const handler = await notifyHookup(target, propKey, notifyParam);
            if (handler !== undefined) {
                this.#eventHandlers[propKey] = handler;
            }
        }
    }
    async finale(proxy, target, beDecorProps) {
        //TODO: clean up event handlers.
        const { unsubscribe } = await import('trans-render/lib/subscribe.js');
        unsubscribe(target);
        for (const key in this.#eventHandlers) {
            target.removeEventListener(key, this.#eventHandlers[key]);
        }
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
            virtualProps: []
        }
    },
    complexPropDefaults: {
        controller: BeNoticedController
    }
});
register(ifWantsToBe, upgrade, tagName);
