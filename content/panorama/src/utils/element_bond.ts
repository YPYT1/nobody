import { default as ElementBondConst } from '../json/config/game/element_bond.json';

/** 六大元素关键词 */
export const ELEMENT_KEYS_LIST: CElementType[] = ['null', 'fire', 'ice', 'thunder', 'wind', 'light', 'dark'];

type ElementBondTypeKey = keyof typeof ElementBondConst;
type ElementBondTypeRowData = (typeof ElementBondConst)[ElementBondTypeKey];

interface ElementBondProps {
    [element: string]: number[];
}

export const GetElementBondTable = () => {
    const element_table: { [element: string]: number[] } = {};

    for (const k in ElementBondConst) {
        const row_data = ElementBondConst[k as keyof typeof ElementBondConst];
        const CElementType = row_data.CElementType;
        const activate_count = row_data.activate_count;
        if (element_table[CElementType] == null) {
            element_table[CElementType] = [];
        }
        element_table[CElementType].push(activate_count);
    }

    return element_table;
};
