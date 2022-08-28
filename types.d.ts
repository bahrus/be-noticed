import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {INotify} from 'trans-render/lib/types';

export type INotifyMap<TSelf = any, TProps = any, TActions = TProps> = {[key in keyof TSelf]: INotify<TSelf, TProps, TActions>};


export interface BeNoticedVirtualProps extends MinimalProxy{
    //eventHandlers: EventHandler[];
}



export interface BeNoticedProps extends BeNoticedVirtualProps{
    proxy: Element & BeNoticedVirtualProps;
}

export interface BeNoticedActions{
    intro(proxy: Element & BeNoticedVirtualProps, target: Element, beDecorProps: BeDecoratedProps): void;
    finale(proxy: Element & BeNoticedVirtualProps, target:Element, beDecorProps: BeDecoratedProps): void;
}