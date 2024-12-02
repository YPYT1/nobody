
interface ComponentProps {
    prop_item: GameComponent_PropItem;
    prop_item_star: GameComponent_PropItemStar;
}

// export function LoadComponent_Card<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
//     e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/_components/${key}/${key}.xml`, true, false);
//     return e as ComponentProps[K]
// }

export function LoadGameComponent<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/home/component/${key}/${key}.xml`, true, false);
    return e as ComponentProps[K]
}

export function CreateGameComponent<K extends keyof ComponentProps>(root: Panel, key: K, id: string) {
    let compPanel = $.CreatePanel("Panel", root, id) as ComponentProps[K];
    compPanel.BLoadLayout(`file://{resources}/layout/custom_game/home/component/${key}/${key}.xml`, true, false)
    return compPanel
}