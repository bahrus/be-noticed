import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
export class BeNoticed extends EventTarget {
    #controllers;
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
        const { notifyHookup } = await import('trans-render/lib/notifyHookup.js');
        this.#controllers = [];
        for (const propKey in params) {
            const pram = params[propKey];
            const notifyParam = (typeof pram === 'string') ? { fn: pram, tocoho: true, nudge: true } : pram;
            const handler = await notifyHookup(target, propKey, notifyParam);
            this.#controllers.push(handler.controller);
        }
        proxy.resolved = true;
    }
    disconnect() {
        if (this.#controllers === undefined)
            return;
        for (const c of this.#controllers) {
            c.abort();
        }
    }
    async finale(proxy, target, beDecorProps) {
        this.disconnect();
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
        controller: BeNoticed
    }
});
register(ifWantsToBe, upgrade, tagName);
