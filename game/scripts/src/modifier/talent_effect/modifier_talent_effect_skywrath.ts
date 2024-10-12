import { BaseAbility, BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import { modifier_talent_effect } from "./modifier_talent_effect";


/** 通用天赋属性效果 */
@registerModifier()
export class modifier_talent_effect_skywrath extends modifier_talent_effect {

    _OnCreated(): void {
        
    }

    OnIntervalThink(): void {
        let caster_hp_pct = this.caster.GetHealthPercent();
        let caster_mp_pct = this.caster.GetManaPercent();

    }

    OnCriticalStrike(hTarget: CDOTA_BaseNPC): void {
        
    }

    OnDodge(hAttacker: CDOTA_BaseNPC): void {
        
    }
}