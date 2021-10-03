export interface INotify{
    valFromTarget?: string;
    vft?: string;
    valFromEvent?: string;
    vfe?: string;
    /**
     * Pass property or invoke fn onto custom or built-in element hosting the contents of p-u element.
     */
    toHost: boolean;
    /**
     * Id of Dom Element.  Uses import-like syntax:
     * ./my-id searches for #my-id within ShadowDOM realm of pass-up (p-u) instance.
     * ../my-id searches for #my-id one ShadowDOM level up.
     * /my-id searches from outside any ShadowDOM.
     * @attr
     */
    to?: string;

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

    /**
     * Name of property to set on matching (upstream) element.
     * @attr
     */
    prop?: string;

    /**
     * Name of method or property arrow function to invoke on matching (upstream) element.
     */
    fn?: string;

    withArgs: ('self' | 'val' | 'event')[];

    doInit: boolean;

    clone: boolean;

    parseValAs: string;

    plusEq: boolean;

    eqConst: any;

    toggleProp: boolean;

    trueVal?: any;

    falseVal?: any;

    as?: 'str-attr' | 'bool-attr' | 'obj-attr',
    
}