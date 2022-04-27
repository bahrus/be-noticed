# be-noticed

be-noticed is a member of the [may-it-be](https://github.com/bahrus/may-it-be) family of web components.

[![Playwright Tests](https://github.com/bahrus/be-noticed/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/be-noticed/actions/workflows/CI.yml)

It strives to accomplish the same thing as the [pass-up](https://github.com/bahrus/pass-up) custom element, but in a possibly more performant way in many circumstances.  It uses attributes rather than elements to bind things together.  So instead of:

```html

<template be-definitive='{
    "config": {
        "tagName": "my-counter",
        "propDefaults":{
            "count": 30
        },
        "transform": {
            "span": "count"
        }
    }
}'>
    <button part=down data-d=-1>-</button>
    <pass-up on=click to-host prop=count plus-eq val=target.dataset.d parse-val-as=int></pass-up>
    <span part=count></span>
    <button part=up data-d=1>+</button>
    <pass-up on=click to-host prop=count plus-eq val=target.dataset.d parse-val-as=int></pass-up>
    <style></style>            
</template>

<my-counter></my-counter>
```

we have:

```html
<template be-definitive='{
    "config": {
        "tagName": "my-counter",
        "propDefaults":{
            "count": 30
        },
        "transform": {
            "span": "count"
        }
    }
}'>
    <button part=down data-d=-1 be-noticed='{
        "click":{ "prop": "count", "plusEq": true, "vft": "dataset.d", "parseValAs": "int"}
    }'>-</button>
    <span part=count></span>
    <button part=up data-d=1 be-noticed='{
        "click":{ "prop": "count", "plusEq": true, "vft": "dataset.d", "parseValAs": "int"}
    }'>+</button>
    <style></style>            
</template>
<my-counter></my-counter>
```

## Responding to property changes

By default, the keys of the expression, for example "click", is assumed to be an event "type" name to attach to the element.

However, in many scenarios, we want to respond to property changes that don't emit events.  Signify this by ending the key with ":onSet":

```html
    <my-fetch-component href="//example.com/api" be-noticed='{
        "fetchedData:onSet": { "prop": "newData" }
    }'></my-fetch-component>
```

This will set the host element's "newData" property to my-fetch-component's fetchedData property.

## Shortcuts

By default, the "recipient" of the message will be the host custom element containing the decorated element.

However, alternative recipients can be specified:

```TypeScript
    /**
     * Id of Dom Element.  Uses import-like syntax:
     * ./my-id searches for #my-id within ShadowDOM realm of pass-up (p-u) instance.
     * ../my-id searches for #my-id one ShadowDOM level up.
     * /my-id searches from outside any ShadowDOM.
     * @attr
     */
    toUpShadow?: string;

    /**
     * Pass property or invoke fn onto itself
     */
    toSelf?: boolean;
    
    /**
     * Pass property to the nearest previous sibling / ancestor element matching this css pattern, using .previousElement(s)/.parentElement.matches method. 
     * Does not pass outside ShadowDOM realm.
     */
    toNearestUpMatch?: string;

    toClosest?: string;
```

If a simple string is provided as the rhs:

```html
<input be-noticed='{
    "change": "handleValueChange"
}'>
```

... then method "handleValueChange" on the host element containing the input element wil be called when the input's change event fires.

**NB I:** Editing large JSON attributes like this is quite error-prone, if you are like me.  The [json-in-html](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) VSCode extension can help with this issue.  That extension is compatible with [pressing "." on the github page](https://github.dev/bahrus/be-observant). 

**NB II:** Whilst the first example involves more tags, and may often impose a slightly higher performance penalty, it is (subjectively) a bit more pleasant to type, and to reason about, add comments to, and to debug.  Perhaps starting with the former approach, and then moving to this approach when it is close to being ready for production may be the way to reconcile this.  Other approaches could be to transform one into the other during build time, or sometime during template processing (pre- or post- cloning).

**NB III:**  The attribute name "be-noticed" is configurable.  "data-be-noticed" also works, with the default configuration. 
