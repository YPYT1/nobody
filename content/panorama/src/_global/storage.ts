export const GLOBAL_FILE = "storage";

interface StorageKeyList {
    backpack_count_table: { [item: string]: number };
    currency_count: { [item: string]: number };
    unix_time: number;
    today_time: number;
    shoping_limit: AM2_Server_Shopping_Limit_List;
    talent_config_index: { [heroid: number]: number };
    talent_data: { [hero_id: number]: NetworkedData<CGEDGetTalentListInfo[]> };
    /** 符文属性, 特殊类型 key值*/
    __rune_attr: { [x: string]: number; }
}

declare global {

    interface CustomUIConfig {
        __storage: { [key: string]: any; };
        setStorage<T extends keyof StorageKeyList>(key: T, value: StorageKeyList[T]): void
        getStorage<T extends keyof StorageKeyList>(key: T): StorageKeyList[T] | null
        clearStorage<T extends keyof StorageKeyList>(key: T): void;
    }
}



function setStorage<T extends keyof StorageKeyList>(key: T, value: StorageKeyList[T]) {
    if (GameUI.CustomUIConfig().__storage == null) {
        GameUI.CustomUIConfig().__storage = {};
    }
    GameUI.CustomUIConfig().__storage[key] = value;
};



function getStorage<T extends keyof StorageKeyList>(key: T): StorageKeyList[T] | null {
    if (GameUI.CustomUIConfig().__storage == null) {
        return null
    }
    return GameUI.CustomUIConfig().__storage[key];
}

function clearStorage<T extends keyof StorageKeyList>(key: T) {
    delete GameUI.CustomUIConfig().__storage[key]
}

GameUI.CustomUIConfig().setStorage = setStorage;
GameUI.CustomUIConfig().getStorage = getStorage;
GameUI.CustomUIConfig().clearStorage = clearStorage;
