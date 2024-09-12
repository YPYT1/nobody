import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";


export class ModifierAltarEffect extends BaseModifier {

    effect_fx: ParticleID;
    buff_key = "altar_key";
    color = Vector(255, 255, 255);
    caster: CDOTA_BaseNPC;
    player_id: PlayerID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetParent();
        this.player_id = this.caster.GetPlayerOwnerID();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/custom/altar/altar.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 2, this.color)
        this.AddParticle(effect_fx, false, false, -1, false, false);
        this.effect_fx = effect_fx;
        this._OnCreated(params);
    }

    _OnCreated(params: any) { }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key)
    }

}

// 光明圣坛[黄]	持续15秒，玩家英雄每击杀一个敌军单位恢复该单位最大生命值的血量。
@registerModifier()
export class modifier_altar_effect_1 extends ModifierAltarEffect {

    buff_key: string = "altar_1"
    color = Vector(255, 230, 2);

    _OnCreated(params: any): void {

    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_DEATH
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.attacker != this.GetParent()) { return }
        let health = event.unit.GetMaxHealth();
        GameRules.BasicRules.Heal(event.attacker, health)
    }
}

// 2 神速圣坛[红]	持续15秒，玩家英雄移动速度提高100%，且免疫减速效果。
@registerModifier()
export class modifier_altar_effect_2 extends ModifierAltarEffect {

    buff_key: string = "altar_2"
    color = Vector(255, 64, 64);

    _OnCreated(params: any): void {
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            MoveSpeed: {
                "BasePercent": 100,
                "Last": 1,
            }
        })
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.UNSLOWABLE]: true
        }
    }
}

// 3	寒冰圣坛[蓝]	持续15秒，冻结玩家英雄半径1000码的所有单位（BOSS除外），被冻结的单位受到伤害时可解冻
@registerModifier()
export class modifier_altar_effect_3 extends ModifierAltarEffect {

    buff_key: string = "altar_3"
    color = Vector(76, 198, 255);

    _OnCreated(params: any): void {
        this.StartIntervalThink(0.1)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/custom/altar/altar_effect_3.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(1000, 0, 0));
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.caster.GetAbsOrigin(),
            null,
            1000,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            if (!enemy.IsBossCreature() && !enemy.HasModifier("modifier_altar_effect_3_frozen_immune")) {
                enemy.AddNewModifier(enemy, null, "modifier_altar_effect_3_frozen_immune", {})
                enemy.AddNewModifier(enemy, null, "modifier_altar_effect_3_frozen", {})
            }
        }
    }

}
@registerModifier()
export class modifier_altar_effect_3_frozen extends BaseModifier {

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.FROZEN]: true,
            [ModifierState.STUNNED]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetEffectName(): string {
        return "particles/custom/element/ice/ice_effect_frozen.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment_t {
        return ParticleAttachment.ABSORIGIN_FOLLOW
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_lich_ice_age.vpcf"
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        this.Destroy();
        return 0
    }
}

@registerModifier()
export class modifier_altar_effect_3_frozen_immune extends BaseModifier {

    IsHidden(): boolean {
        return true
    }
}

// 4	雷霆圣坛[]	持续15秒，玩家英雄每秒回蓝200，技能急速+500，冷却上限提高45%。
@registerModifier()
export class modifier_altar_effect_4 extends ModifierAltarEffect {

    buff_key: string = "altar_4"
    color = Vector(0, 96, 240);

    _OnCreated(params: any): void {
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            "ManaRegen": {
                "Base": 200,
            },
            "AbilityHaste": {
                "Base": 500,
            },
            "AbilityCooldown": {
                "Limit": 45,
            },
        })
    }
}

// 5	炙热圣坛[红]	持续15秒，玩家英雄造成的伤害翻倍（最终结算）。
@registerModifier()
export class modifier_altar_effect_5 extends ModifierAltarEffect {

    buff_key: string = "altar_5"
    color = Vector(248, 60, 3);

    _OnCreated(params: any): void {

        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            "FinalDamageMul": {
                "Base": 100,
            },
        })
    }
}

// 6	神圣圣坛[]	持续15秒，玩家英雄免疫所有伤害。
@registerModifier()
export class modifier_altar_effect_6 extends ModifierAltarEffect {

    buff_key: string = "altar_6"
    color = Vector(255, 150, 52);

    _OnCreated(params: any): void {
        this.caster.AddNewModifier(this.caster, null, "modifier_state_damage_immunity", { duration: this.GetDuration() })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.caster.RemoveModifierByName("modifier_state_damage_immunity")
    }


}

// 7	经验圣坛[紫色]	持续15秒，玩家英雄击杀的所有单位经验值掉落翻倍。
@registerModifier()
export class modifier_altar_effect_7 extends ModifierAltarEffect {

    buff_key: string = "altar_7"
    color = Vector(147, 0, 206);


    _OnCreated(params: any): void {
        GameRules.PlayerAttribute.ModifyPlayerAttribute(this.player_id, {
            "drop_double_exp": 100,
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.PlayerAttribute.ModifyPlayerAttribute(this.player_id, {
            "drop_double_exp": -100,
        })
    }

}

// 8	灵魂圣坛[绿]	持续15秒，玩家英雄击杀的所有单位灵魂掉落翻倍。
@registerModifier()
export class modifier_altar_effect_8 extends ModifierAltarEffect {

    buff_key: string = "altar_8"
    color = Vector(4, 109, 1);

    _OnCreated(params: any): void {
        GameRules.PlayerAttribute.ModifyPlayerAttribute(this.player_id, {
            "drop_double_soul": 100,
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.PlayerAttribute.ModifyPlayerAttribute(this.player_id, {
            "drop_double_soul": -100,
        })
    }
}

// 9	神秘圣坛	持续20秒，获得以上随机任意一种圣坛效果。
@registerModifier()
export class modifier_altar_effect_9 extends ModifierAltarEffect {

    buff_key: string = "altar_9"
    color = Vector(0, 0, 0);

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        let iIndex = RandomInt(1, 8)
        hParent.AddNewModifier(hParent, null, "modifier_altar_effect_" + iIndex, { duration: 20 })
        this.Destroy()
    }
}