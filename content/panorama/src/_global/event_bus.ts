export const Global = "event_bus";

declare global {

    interface CustomUIConfig {
        EventBus: EventBus;
        ServerEventBus: EventBus;
    }
}



interface CustomEventBusList {
    backpack_update: { [id: string]: AM2_Server_Backpack };
    backpack_count_update: { [item: string]: number };
    popup_loading: { show: boolean };
    open_store_purchase: { id: string };
    // open_rmb_purchase: { id: string, recharge?: number };
    shoping_limit_update: AM2_Server_Shopping_Limit_List

}

interface ICallbackList {
    [id: string]: Function;
}

interface IEventObject {
    [eventName: string]: ICallbackList;
}

interface ISubscribe {
    unSubscribe: () => void;
}

// interface IEventBus {
//     publish<K extends keyof CustomEventBusList>(eventName: K, object: CustomEventBusList[K], ...args: any): void;
//     subscribe<K extends keyof CustomEventBusList>(eventName: K, callback: (event: CustomEventBusList[K]) => void): ISubscribe;
//     subscribeOnce<K extends keyof CustomEventBusList>(eventName: K, callback: (event: CustomEventBusList[K]) => void): ISubscribe;
//     clear(eventName: string): void;
// }



export class EventBus {

    private _eventObject: IEventObject;
    private _callbackId: number;

    constructor() {
        // 初始化事件列表
        this._eventObject = {};
        // 回调函数列表的id
        this._callbackId = 0;
    }

    // 发布事件
    publish<K extends keyof CustomEventBusList>(eventName: K, object: CustomEventBusList[K], ...args: any): void {
        // 取出当前事件所有的回调函数
        const callbackObject = this._eventObject[eventName];
        if (!callbackObject) return $.Msg(eventName + " not found!");

        // 执行每一个回调函数
        for (let id in callbackObject) {
            // 执行时传入参数
            callbackObject[id](object, ...args);

            // 只订阅一次的回调函数需要删除
            if (id[0] === "d") {
                delete callbackObject[id];
            }
        }
    }

    // 订阅事件

    subscribe<K extends keyof CustomEventBusList>(eventName: K, callback: (event: CustomEventBusList[K]) => void): ISubscribe {
        // 初始化这个事件
        if (!this._eventObject[eventName]) {
            // 使用对象存储，注销回调函数的时候提高删除的效率
            this._eventObject[eventName] = {};
        }
        const id = this._callbackId++;
        // $.Msg(["subscribe:", eventName, id])
        // 存储订阅者的回调函数
        // callbackId使用后需要自增，供下一个回调函数使用
        this._eventObject[eventName][id] = callback;


        // 每一次订阅事件，都生成唯一一个取消订阅的函数
        const unSubscribe = () => {
            // 清除这个订阅者的回调函数
            delete this._eventObject[eventName][id];

            // 如果这个事件没有订阅者了，也把整个事件对象清除
            if (Object.keys(this._eventObject[eventName]).length === 0) {
                delete this._eventObject[eventName];
            }
        };

        return { unSubscribe };
    }

    // 只订阅一次
    subscribeOnce<K extends keyof CustomEventBusList>(eventName: K, callback: (event: CustomEventBusList[K]) => void): ISubscribe {
        // 初始化这个事件
        if (!this._eventObject[eventName]) {
            // 使用对象存储，注销回调函数的时候提高删除的效率
            this._eventObject[eventName] = {};
        }

        // 标示为只订阅一次的回调函数
        const id = "d" + this._callbackId++;

        // 存储订阅者的回调函数
        // callbackId使用后需要自增，供下一个回调函数使用
        this._eventObject[eventName][id] = callback;

        // 每一次订阅事件，都生成唯一一个取消订阅的函数
        const unSubscribe = () => {
            // 清除这个订阅者的回调函数
            delete this._eventObject[eventName][id];

            // 如果这个事件没有订阅者了，也把整个事件对象清除
            if (Object.keys(this._eventObject[eventName]).length === 0) {
                delete this._eventObject[eventName];
            }
        };

        return { unSubscribe };
    }

    // 清除事件
    clear<K extends keyof CustomEventBusList>(eventName?: K): void {
        // 未提供事件名称，默认清除所有事件
        if (!eventName) {
            this._eventObject = {};
            return;
        }

        // 清除指定事件
        delete this._eventObject[eventName];
    }

    removeAllListeners() {
        this._eventObject = {};
    }
}

if (GameUI.CustomUIConfig().EventBus == null) {
    GameUI.CustomUIConfig().EventBus = new EventBus();
}