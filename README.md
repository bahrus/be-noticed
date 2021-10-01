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
            "on": {
                "click":{ "toHost": true, "prop": "count", "plusEq": true, "val": "target.dataset.d", "parseValAs": "int"}
            }
        }'>-</button>
        <span part=count></span>
        <button part=up data-d=1 be-noticed='{
            "on": {
                "click":{ "toHost": true, "prop": "count", "plusEq": true, "val": "target.dataset.d", "parseValAs": "int"}
            }
        }'>+</button>
        <style></style>            
    </template>
</d-fine>
<my-counter></my-counter>
```
