import { GetItemImageSrc } from '../../common/custom_kv_method';
import { HideCustomTooltip, ShowCustomTooltip } from '../../utils/custom_tooltip';
import { default as NpcItemCustom } from './../../json/npc_items_custom.json';

const ItemPickButton = ({ item_name }: { item_name: string }) => {
    const image_src = GetItemImageSrc(item_name);

    return (
        <Button
            className="ItemPickButton"
            onactivate={() => {
                const queryUnit = Players.GetLocalPlayerPortraitUnit();
                GameEvents.SendCustomGameEventToServer('Development', {
                    event_name: 'CreatedItem',
                    params: {
                        item_name: item_name,
                        queryUnit: queryUnit,
                    },
                });
            }}
            onmouseover={e => {
                ShowCustomTooltip(e, 'item', item_name, -1, 0);
                // $.DispatchEvent("DOTAShowTextTooltip", e, $.Localize("#DOTA_Tooltip_Ability_" + abilityname));
            }}
            onmouseout={() => {
                HideCustomTooltip();
                // $.DispatchEvent("DOTAHideTextTooltip");
            }}
        >
            {/* <Image className="ItemImage" src={image_src} scaling='stretch-to-fit-y-preserve-aspect' /> */}
            <DOTAItemImage itemname={item_name} showtooltip={false} />
        </Button>
    );
};
export const ItemListPick = () => {
    return (
        <Panel id="ItemListPick">
            <Panel className="ItemList">
                {Object.keys(NpcItemCustom).map((v, k) => {
                    return <ItemPickButton key={k} item_name={v} />;
                })}
            </Panel>
        </Panel>
    );
};
