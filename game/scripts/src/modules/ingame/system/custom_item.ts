import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

type ItemListKey = "hp" | "mp" | "all"
@reloadable
export class CustomItem extends UIEventRegisterClass {

    constructor() {
        super("CustomItem", true)
    }

    Drop(item_key: ItemListKey, vPos: Vector) {
        let unit_name = "npc_item_" + item_key
        let ItemUnit = CreateUnitByName(unit_name, vPos, false, null, null, DotaTeam.NEUTRALS)
        if (ItemUnit) {
            ItemUnit.AddNewModifier(ItemUnit, null, "modifier_pickitem_state", {})
            ItemUnit.AddNewModifier(ItemUnit, null, "modifier_generic_arc_lua", {
                speed: 250,
                distance: 30,
                duration: 0.5,
                height: 150,
            })
        }

    }

    // 物品效果
    useItemEffect(item_name: string, hUnit: CDOTA_BaseNPC) {
        if (item_name == "npc_item_hp") {
            let effect_fx = ParticleManager.CreateParticle(
                "particles/items3_fx/fish_bones_active.vpcf",
                ParticleAttachment.POINT_FOLLOW,
                hUnit
            )
            ParticleManager.ReleaseParticleIndex(effect_fx)
            //25%最大生命
            GameRules.BasicRules.Heal(hUnit, hUnit.GetMaxHealth() * 0.25)
        } else if (item_name == "npc_item_mp") {
            let effect_fx = ParticleManager.CreateParticle(
                "particles/items3_fx/mango_active.vpcf",
                ParticleAttachment.POINT_FOLLOW,
                hUnit
            )
            ParticleManager.ReleaseParticleIndex(effect_fx)
            // 50%最大蓝量
            GameRules.BasicRules.RestoreMana(hUnit, hUnit.GetMaxMana() * 0.5)
        } else if (item_name == "npc_item_all") {
            let effect_fx = ParticleManager.CreateParticle(
                "particles/items3_fx/iron_talon_active.vpcf",
                ParticleAttachment.POINT_FOLLOW,
                hUnit
            )
            ParticleManager.ReleaseParticleIndex(effect_fx)

            GameRules.BasicRules.Heal(hUnit, hUnit.GetMaxHealth())
            GameRules.BasicRules.RestoreMana(hUnit, hUnit.GetMaxMana())
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (cmd == "-drop") {
            let item = (args[0] ?? "hp") as ItemListKey;
            this.Drop(item, hHero.GetAbsOrigin() + RandomVector(150) as Vector)
        }
    }
}