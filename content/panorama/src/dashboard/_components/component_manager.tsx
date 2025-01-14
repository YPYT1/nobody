
interface ComponentProps {
    card_item: Component_CardItem;
    server_item: Component_ServerItem;
    row_attribute: Component_RowAttribute;
    server_item_name: Component_ServerItemName;
    store_item: Component_StoreItem;
    store_item_ex1: Component_StoreItemEx1;
    backpack_count: Component_BackpackCount;
}


export function LoadCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, false, false);
    return e as ComponentProps[K]
}

export function SetCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K, item_id: string) {
    e.Data<PanelDataObject>().item_id = item_id
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, false, false);
    return e as ComponentProps[K]
}

export function CreateCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K, id: string) {
    let compPanel = $.CreatePanel("Panel", e, id) as ComponentProps[K];
    // $.Msg(["compPanel",compPanel])
    // $.Msg(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`)
    compPanel.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, false, false)
    return compPanel
}