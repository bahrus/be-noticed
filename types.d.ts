import {BeDecoratedProps, MinimalProxy} from 'be-decorated/types';
import {INotify} from 'trans-render/lib/types';

export type INotifyMap<TSelf = any, TProps = any, TActions = TProps> = {[key in keyof TSelf]: INotify<TSelf, TProps, TActions>};


export interface VirtualProps extends MinimalProxy{
    //eventHandlers: EventHandler[];
}

export type Proxy = Element & VirtualProps;

export interface ProxyProps extends VirtualProps{
    proxy: Proxy;
}

export type PP = ProxyProps;

export interface BeNoticedProps extends VirtualProps{
    proxy: Element & VirtualProps;
}

export interface Actions{
    intro(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps): void;
    finale(proxy: Proxy, target:Element, beDecorProps: BeDecoratedProps): void;
}