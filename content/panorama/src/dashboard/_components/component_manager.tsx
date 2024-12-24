
interface ComponentProps {
    card_item: Component_CardItem;
    server_item: Component_ServerItem;
    row_attribute: Component_RowAttribute;
    server_item_name: Component_ServerItemName;
    store_item: Component_StoreItem;
    store_item_ex1: Component_StoreItemEx1;
}

// export function LoadComponent_Card<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
//     e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false);
//     return e as ComponentProps[K]
// }

export function LoadCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false);
    return e as ComponentProps[K]
}

export function CreateCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K, id: string) {
    let compPanel = $.CreatePanel("Panel", e, id) as ComponentProps[K];
    // $.Msg(["compPanel",compPanel])
    // $.Msg(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`)
    compPanel.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false)
    return compPanel
}