import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

import * as NpcAbilityCustom from "./../../json/npc_abilities_custom.json"

const UpdateAttributeKyes: AttributeMainKey[] = [
    "AttackRate",
    "AttackDamage",
    "AttackRange",
    "AttackSpeed",
    "MoveSpeed",
    "HealthPoints",
    "HealthRegen",
    "ManaPoints",
    "ManaRegen",
    "PickItemRadius",
];

// 属性
@registerAbility()
export class public_attribute extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_attribute"
    }
}

@registerModifier()
export class modifier_public_attribute extends BaseModifier {

    bIsHero: boolean;
    BaseKvHp: number;
    AttributeData: CustomAttributeValueType;
    PickItemFx: ParticleID;
    hParent: CDOTA_BaseNPC;

    timer: number;
    IsHidden(): boolean { return true }
    RemoveOnDeath(): boolean { return false; }
    GetAttributes(): ModifierAttribute { return ModifierAttribute.PERMANENT }

    /** 初始化属性 */
    OnCreated(params: any): void {
        this.AttributeData = {}
        this.BaseKvHp = this.GetParent().GetMaxHealth();
        this.SetHasCustomTransmitterData(true);
        if (!IsServer()) { return; }
        this.hParent = this.GetParent();
        this.timer = 0;
        this.StartIntervalThink(0.02)


        // this.PickItemFx = ParticleManager.CreateParticle(
        //     "particles/ui_mouseactions/range_display.vpcf",
        //     ParticleAttachment.ABSORIGIN_FOLLOW,
        //     this.GetParent()
        // )
        // ParticleManager.SetParticleControl(this.PickItemFx, 1, Vector(100, 0, 0));
        // this.AddParticle(this.PickItemFx, false, false, -1, false, false)
        //
    }

    /** 更新属性 */
    OnRefresh(params: any): void {
        if (!IsServer()) { return; }
        this._UpdateAttribute();
    }

    OnIntervalThink(): void {
        this.timer += 1;
        if (this.timer % 10 == 0) {
            this.timer = 0;
            let vPos = this.hParent.GetAbsOrigin();
            let ExpItems = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                vPos,
                null,
                this.AttributeData.PickItemRadius,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.OTHER,
                UnitTargetFlags.INVULNERABLE,
                FindOrder.ANY,
                false
            )
            // print("ExpItems",ExpItems.length)
            for (let ExpItem of ExpItems) {
                // print("RowName",ExpItem.GetUnitName())
                if (ExpItem.GetUnitName() == "npc_exp"
                    && !ExpItem.HasModifier("modifier_pick_animation")
                    && !ExpItem.HasModifier("modifier_generic_arc_lua")
                ) {
                    ExpItem.AddNewModifier(this.hParent, null, "modifier_pick_animation", {})
                }
            }
        }

        // let fGameTime = GameRules.GetDOTATime(false, false);
        // // print("fGameTime",fGameTime)
        // for (let i = 0; i < 6; i++) {
        //     let hItem = this.hParent.GetItemInSlot(i);
        //     if (hItem && (hItem.ArmsActTime ?? 0) <= fGameTime) {
        //         hItem._ArmsEffectStart();
        //     }
        // }
    }

    _UpdateAttribute() {
        // print("[modifier_public_attribute]:_UpdateAttribute");
        let hUnit = this.GetParent() as CDOTA_BaseNPC_Hero;
        for (let k of UpdateAttributeKyes) {
            if (k == "PickItemRadius") {
                this.AttributeData[k] = math.max(50, hUnit.custom_attribute_value[k]);
                // ParticleManager.SetParticleControl(this.PickItemFx, 1, Vector(this.AttributeData[k], 0, 0));
            } else {
                this.AttributeData[k] = hUnit.custom_attribute_value[k];
            }
        }
        this.SendBuffRefreshToClients();
        hUnit.CalculateStatBonus(true);
        // 写入网表
        CustomNetTables.SetTableValue("unit_attribute", `${hUnit.GetEntityIndex()}`, {
            table: hUnit.custom_attribute_table,
            value: hUnit.custom_attribute_value,
        })
    }

    AddCustomTransmitterData() {
        let hUnit = this.GetParent();
        let TransmitterData: CustomAttributeValueType = {};
        for (let k of UpdateAttributeKyes) {
            TransmitterData[k] = hUnit.custom_attribute_value[k]
        }
        return TransmitterData
    }

    HandleCustomTransmitterData(data: CustomAttributeValueType) {
        this.AttributeData = data;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.PROVIDES_VISION]: true,
            [ModifierState.BLOCK_DISABLED]: true,

        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.BASEATTACK_BONUSDAMAGE,
            ModifierFunction.ATTACK_RANGE_BASE_OVERRIDE,
            ModifierFunction.BASE_ATTACK_TIME_CONSTANT,
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
            ModifierFunction.MOVESPEED_BASE_OVERRIDE,
            ModifierFunction.HEALTH_BONUS,
            ModifierFunction.HEALTH_REGEN_CONSTANT,
            ModifierFunction.MANA_BONUS,
            ModifierFunction.MANA_REGEN_CONSTANT,
        ]
    }

    GetModifierAttackRangeOverride(): number {
        return this.AttributeData.AttackRange
    }

    GetModifierBaseAttack_BonusDamage(): number {
        return this.AttributeData.AttackDamage
    }

    GetModifierBaseAttackTimeConstant(): number {
        return this.AttributeData.AttackRate
    }

    GetModifierAttackSpeedBonus_Constant(): number {
        return this.AttributeData.AttackSpeed
    }

    GetModifierMoveSpeedOverride(): number {
        return this.AttributeData.MoveSpeed
    }

    GetModifierHealthBonus(): number {
        return math.max(0, (this.AttributeData.HealthPoints ?? 0) - this.BaseKvHp)
    }

    GetModifierConstantHealthRegen(): number {
        return this.AttributeData.HealthRegen
    }

    GetModifierManaBonus(): number {
        return this.AttributeData.ManaPoints
    }

    GetModifierConstantManaRegen(): number {
        return this.AttributeData.ManaRegen
    }

}