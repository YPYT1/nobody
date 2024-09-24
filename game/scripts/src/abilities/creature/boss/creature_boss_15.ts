
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_15	瘟疫	
 * 蓄力3秒，蓄力期间免伤100%若此时对boss造成伤害 伤害来源将变成瘟疫丧尸，移动速度减少50%，无法使用技能无法驱散。持续10秒。
 */
@registerAbility()
export class creature_boss_15 extends BaseCreatureAbility {

    OnAbilityPhaseStart(): boolean {
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_15", {})
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx()
        this.hCaster.RemoveModifierByName("modifier_creature_boss_15");
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_queenofpain/queen_scream_of_wave.vpcf",
            ParticleAttachment.POINT,
            this.hCaster
        )
        ParticleManager.ReleaseParticleIndex(cast_fx)
    }
}

@registerModifier()
export class modifier_creature_boss_15 extends BaseModifier {

    buff_key = "boss_15";

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "DmgReductionPct": {
                "Base": 100,
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        event.attacker.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_boss_15_debuff", {
            duration: 10
        })
        return -100
    }
}

@registerModifier()
export class modifier_creature_boss_15_debuff extends BaseModifier {

    buff_key = "boss_15_debuff"
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent()
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, {
            "MoveSpeed": {
                "BasePercent": -50
            }
        })
        // 隐藏饰品
        // for(this.parent)
        // for (let v of this.GetParent().GetChildren()) {
        //     if (v && v.GetClassname() == "dota_item_wearable") {
        //         v.hi(0)
        //     }
        // }

    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.HEXED]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MODEL_CHANGE
        ]
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }

    GetModifierModelChange(): string {
        return "models/heroes/undying/undying_minion.vmdl"
    }
}