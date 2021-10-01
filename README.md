# be-noticed

be-noticed is a member of the [p-et-alia](https://github.com/bahrus/p-et-alia) family of web components.

It strives to accomplish the same thing as the [pass-up](https://github.com/bahrus/pass-up) custom element, but in a possibly more performant way in many circumstances.  It uses attributes rather than elements to bind things together.  So instead of:

```html
<d-fine templ-child 
    as=my-counter
    prop-defaults='{
        "count": 30
    }'
    transform='{
        "span": "count"
    }'
>
    <template>
        <button part=down data-d=-1>-</button>
        <pass-up on=click to-host prop=count plus-eq val=target.dataset.d parse-val-as=int></pass-up>
        <span part=count></span>
        <button part=up data-d=1>+</button>
        <pass-up on=click to-host prop=count plus-eq val=target.dataset.d parse-val-as=int></pass-up>
        <style></style>            
    </template>
</d-fine>
<my-counter></my-counter>
```

we have:

```html
<d-fine templ-child 
    as=my-counter
    prop-defaults='{
        "count": 30
    }'
    transform='{
        "span": "count"
    }'
>
    <template>
        <button part=down data-d=-1 be-noticed='{
            "click":{ "toHost": true, "prop": "count", "plusEq": true, "val": "target.dataset.d", "parseValAs": "int"}
        }'>-</button>
        <span part=count></span>
        <button part=up data-d=1 be-noticed='{
            "click":{ "toHost": true, "prop": "count", "plusEq": true, "val": "target.dataset.d", "parseValAs": "int"}
        }'>+</button>
        <style></style>            
    </template>
</d-fine>
<my-counter></my-counter>
```

**NB I:** Editing large JSON attributes like this is quite error-prone, if you are like me.  The [json-in-html](https://marketplace.visualstudio.com/items?itemName=andersonbruceb.json-in-html) VSCode extension can help with this issue.  That extension is compatible with [pressing "." on the github page](https://github.dev/bahrus/be-observant). 

**NB II:** Whilst the first example involves more tags, and may often impose a slightly higher performance penalty, it is (subjectively) a bit more pleasant to type, and to reason about, add comments to, and to debug.  Perhaps starting with the former approach, and then moving to this approach when it is close to being ready for production may be the way to reconcile this.  Other approaches could be to transform one into the other during build time, or sometime during template processing (pre- or post- cloning).

**NB III:**  The attribute name "be-noticed" is configurable.  "data-be-noticed" also works, with the default configuration. 
