
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_15	瘟疫	
 * 蓄力3秒，蓄力期间免伤100%若此时对boss造成伤害 伤害来源将变成瘟疫丧尸，移动速度减少50%，无法使用技能无法驱散。持续10秒。
 */
@registerAbility()
export class creature_boss_15 extends BaseCreatureAbility {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_queenofpain/queen_scream_of_wave.vpcf", context)
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
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

    attack_list: CDOTA_BaseNPC[];

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.attack_list = [];
        GameRules.EnemyAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            "DmgReductionPct": {
                "Base": 100,
            }
        })
    }


    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (this.attack_list.indexOf(event.attacker) < 0) {
            this.attack_list.push(event.attacker)
        }
        return -999
    }

    OnDestroy(): void {
        if (!IsServer()) { return };
        GameRules.EnemyAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
        for (let unit of this.attack_list) {
            unit.AddNewModifier(this.GetCaster(), this.GetAbility(), "modifier_creature_boss_15_debuff", {
                duration: 10
            })
        }
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
        this.HideWearable()

    }

    HideWearable() {
        // 隐藏饰品
        for (let v of this.GetParent().GetChildren()) {
            // print(v, v.GetClassname())
            if (v && v.GetClassname() == "wearable_item") {
                // print("hide war");
                (v as CDOTA_BaseNPC).SetModel("models/development/invisiblebox.vmdl")
            }
        }
    }

    ShowWearable() {
        for (let v of this.GetParent().GetChildren()) {
            if (v && v.GetClassname() == "wearable_item") {
                let wrarable = v as CDOTA_BaseNPC
                wrarable.SetModel(wrarable.wrarable_model)
            }
        }
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.DISARMED]: true,
            [ModifierState.SILENCED]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MODEL_CHANGE,
        ]
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.buff_key);
        this.ShowWearable()
    }

    GetModifierModelChange(): string {
        return "models/heroes/undying/undying_minion.vmdl"
    }
}