import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as TalentTreeConfig from "../../json/config/game/hero/talent_tree/talent_tree_config.json";


/** 通用神秘商店效果 */
@registerModifier()
export class modifier_prop_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    player_id: PlayerID;
    ability: CDOTABaseAbility;
    object: { [rune: string]: AbilityValuesProps };

    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this.object = {}

        // 部分定时器

        this.OnRefresh(params);
        this.StartIntervalThink(1)
    }


    InputAbilityValues(name: string, input: AbilityValuesProps): void {
        this.object[name] = input
    }

    GetObject<
        Key extends keyof typeof TalentTreeConfig,
        T2 extends typeof TalentTreeConfig[Key]
    >(name: Key, key: keyof T2["AbilityValues"]) {
        return this.object[name as string][key as string]
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) { return }
    }

    OnBeInjured(params: ApplyCustomDamageOptions) { }

    OnKillEvent(hTarget: CDOTA_BaseNPC) {

    }
}