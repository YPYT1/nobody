import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as TalentTreeConfig from "../../json/config/game/hero/talent_tree/talent_tree_config.json";
import * as HeroCustomJson from "../../json/npc_heroes_custom.json";

/** 通用天赋属性效果 */
@registerModifier()
export class modifier_talent_effect extends BaseModifier {

    caster: CDOTA_BaseNPC;
    player_id: PlayerID;
    ability: CDOTABaseAbility;
    object: { [talent: string]: AbilityValuesProps };

    link_mdf: modifier_talent_effect;
    IsHidden(): boolean { return true }
    IsPermanent(): boolean { return true }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability = this.GetAbility();
        this.player_id = this.caster.GetPlayerOwnerID();
        this.object = {}
        this._OnCreated()
        this.StartIntervalThink(1)
    }

    _OnCreated() {
        let heroName = this.caster.GetUnitName()
        let hero_data = HeroCustomJson[heroName as "npc_dota_hero_drow_ranger"];
        if (hero_data && hero_data.talent_mdf_name) {
            this.link_mdf = this.caster.AddNewModifier(
                this.caster,
                this.GetAbility(),
                hero_data.talent_mdf_name,
                {}
            ) as modifier_talent_effect
        }

    }

    InputAbilityValues(name: string, input: AbilityValuesProps): void {
        if (this.link_mdf) {
            this.link_mdf.InputAbilityValues(name, input)
        } else {
            this.object[name] = input
        }

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

    OnBeInjured(params: ApplyCustomDamageOptions):boolean {
        if (this.link_mdf) {
            if(this.link_mdf.OnBeInjured(params)) {
                return true
            }
        }
        return false
    }

    /** 触发暴击 */
    OnCriticalStrike(hTarget: CDOTA_BaseNPC) {
        if (this.link_mdf) {
            this.link_mdf.OnCriticalStrike(hTarget)
        }
    }

    /** 触发闪避 */
    OnDodge(hAttacker: CDOTA_BaseNPC) {
        if (this.link_mdf) {
            this.link_mdf.OnDodge(hAttacker)
        }
    }

    /** 击杀单位 */
    OnKillEvent(hTarget: CDOTA_BaseNPC) {
        if (this.link_mdf) {
            this.link_mdf.OnKillEvent(hTarget)
        }
    }
}