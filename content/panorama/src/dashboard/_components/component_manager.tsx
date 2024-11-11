
interface ComponentProps {
    card_item: Component_CardItem;
    server_item: Component_ServerItem;
    row_attribute: Component_RowAttribute;
}

export function LoadComponent_Card<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false);
    return e as ComponentProps[K]
}

export function LoadCustomComponent<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false);
    return e as ComponentProps[K]
}
