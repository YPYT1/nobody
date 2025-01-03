import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

// prop_41	【神秘齿轮】	每%interval%秒转动一次，每次获得随机效果，持续%duration%秒
/**
 * 1.攻击力+25%
    2.元素攻击+15%
    3.技能强度+25%
    4.移动速度+50%
    5.防御力+25%
    6.双倍灵魂获取
    7.双倍经验获取
    8.移动速度减少25%
    9.每秒扣除5%最大生命值
    10.技能蓝耗+100%
*/
@registerModifier()
export class modifier_shop_prop_41 extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster()
        let order = RandomInt(1, 10);
        let name = "modifier_shop_prop_41_" + order;
        hCaster.AddNewModifier(hCaster, null, name, { duration: this.GetDuration() });
        this.Destroy()
    }

}

class modifier_shop_prop_41_temp extends BaseModifier {

    buff_key = "prop_41_temp";
    attr_list: CustomAttributeTableType = {}

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, this.attr_list)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }
}

// 攻击力+25%
@registerModifier()
export class modifier_shop_prop_41_1 extends BaseModifier {

    buff_key = "prop_41_1";
    attr_list: CustomAttributeTableType = {
        "AttackDamage": {
            "BasePercent": 25
        }
    }
}

//2.元素攻击+15%
@registerModifier()
export class modifier_shop_prop_41_2 extends BaseModifier {

    buff_key = "prop_41_2";
    attr_list: CustomAttributeTableType = {
        "AllElementDamageBonus": {
            "Base": 15
        }
    }
}
//3.技能强度+25%
@registerModifier()
export class modifier_shop_prop_41_3 extends BaseModifier {

    buff_key = "prop_41_3";
    attr_list: CustomAttributeTableType = {
        "AbilityImproved": {
            "Base": 25
        }
    }
}
//4.移动速度+50%
@registerModifier()
export class modifier_shop_prop_41_4 extends BaseModifier {

    buff_key = "prop_41_4";
    attr_list: CustomAttributeTableType = {
        "MoveSpeed": {
            "BasePercent": 50
        }
    }
}
//5.防御力+25%
@registerModifier()
export class modifier_shop_prop_41_5 extends BaseModifier {

    buff_key = "prop_41_5";
    attr_list: CustomAttributeTableType = {
        "PhyicalArmor": {
            "BasePercent": 25
        }
    }
}
//6.双倍灵魂获取
@registerModifier()
export class modifier_shop_prop_41_6 extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        GameRules.ResourceSystem.ModifyAcquisitionRate(this.parent.GetPlayerOwnerID(), "Soul", 100)
        // GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, this.attr_list)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.ResourceSystem.ModifyAcquisitionRate(this.parent.GetPlayerOwnerID(), "Soul", -100)
    }
}
//7.双倍经验获取
@registerModifier()
export class modifier_shop_prop_41_7 extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        GameRules.ResourceSystem.ModifyAcquisitionRate(this.parent.GetPlayerOwnerID(), "SingleExp", 100)
        // GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, this.attr_list)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.ResourceSystem.ModifyAcquisitionRate(this.parent.GetPlayerOwnerID(), "SingleExp", -100)
    }
}
//8.移动速度减少25 %
@registerModifier()
export class modifier_shop_prop_41_8 extends BaseModifier {

    buff_key = "prop_41_8";
    attr_list: CustomAttributeTableType = {
        "PhyicalArmor": {
            "BasePercent": -25
        }
    }
}
//9.每秒扣除5 % 最大生命值
@registerModifier()
export class modifier_shop_prop_41_9 extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let cost_heath = this.parent.GetMaxHealth() * 0.05;
        ApplyCustomDamage({
            victim: this.caster,
            attacker: this.caster,
            damage: cost_heath,
            damage_type: DamageTypes.PURE,
            ability: null,
        })
    }
}

//10.技能蓝耗 + 100 %
@registerModifier()
export class modifier_shop_prop_41_10 extends BaseModifier {

    buff_key = "prop_41_10";
    attr_list: CustomAttributeTableType = {
        "ManaCostRate": {
            "MulRegion": 100
        }
    }
}