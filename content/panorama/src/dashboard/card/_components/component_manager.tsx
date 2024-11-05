

const COMPONENTS_PATH = "file://{resources}/layout/custom_game/dashboard/card/_components/";

interface ComponentProps {
    card_item: Component_CardItem;
}

export function LoadComponent_Card<K extends keyof ComponentProps>(e: Panel, key: K): ComponentProps[K] {
    e.BLoadLayout(`file://{resources}/layout/custom_game/dashboard/card/_components/${key}/${key}.xml`,true,false);
    return e as ComponentProps[K]
}

