
import { HeroTalentObject } from "../../kv_data/hero_talent_object";
import { modifier_rune_effect } from "../../modifier/modifier_rune_effect";
import { BaseAbility, BaseModifier } from "../../utils/dota_ts_adapter";

export class BaseHeroAbility extends BaseAbility {

    init: boolean;
    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    player_id: PlayerID;

    bp_server: number = 0;
    bp_ingame: number = 0;

    /** 技能增伤 */
    ability_bonus: number = 0;
    manacost_bonus: number = 0;
    hero_talent: keyof typeof HeroTalentObject = "drow_ranger";

    GetManaCost(level: number): number {
        if (IsServer()) {
            if (this.caster.custom_attribute_value == null) {
                return super.GetManaCost(-1)
            } else {
                let ManaCostRate = this.caster.custom_attribute_value.ManaCostRate * 0.01
                return super.GetManaCost(-1) * ManaCostRate
            }


        } else {
            let netdata = CustomNetTables.GetTableValue("unit_attribute", `${this.GetCaster().GetEntityIndex()}`)
            let cost_rate = 1;
            if (netdata) {
                cost_rate = netdata.value.ManaCostRate * 0.01
            }
            return super.GetManaCost(-1) * cost_rate
        }

    }

    OnUpgrade(): void {
        if (this.init != true) {
            this.init = true;
            this.caster = this.GetCaster();
            this.player_id = this.caster.GetPlayerOwnerID()
            this.team = this.caster.GetTeamNumber();
            this.InitCustomAbilityType();
        }
        this.UpdataOnUpgrade();
        this.UpdataAbilityValue()
        this.UpdataSpecialValue()
    }

    /** 技能升级更新 */
    UpdataOnUpgrade() { }
    /** 技能的Ability更新 */
    UpdataAbilityValue() { }
    /** 技能的特殊词条更新 */
    UpdataSpecialValue() { }

    InitCustomAbilityType() {
        this.custom_ability_types = {
            skv_type: {
                All: false,
                Null: false,
                Summon: false,
                Ring: false,
                Surround: false,
                Aoe: false,
                Bounce: false,
                Missile: false,
                Targeting: false,
                Dot: false,
                Orb: false,
                Resource: false,
                Growth: false,
                Buff: false,
            },
            element_type: [],
        };
    }

    GetTypesAffixValue<T1 extends keyof SpecialvalueOfTableProps, T2 extends keyof SpecialvalueOfTableProps[T1]>(
        flBaseValue: number, skv_affix: T1, skv_key: T2
    ) {
        if (this.custom_ability_types == null) { return 0 }
        let skv_type = this.custom_ability_types.skv_type[skv_affix]
        if (!skv_type) { return flBaseValue }
        const row_data = GameRules.CustomOverrideAbility.OverrideSpecialValue[this.player_id][skv_key as string]
        if (row_data) {
            // let flBaseValue = value;
            let flAddResult = row_data.base_value;
            let flMulResult = row_data.mul_value;
            let flPercentResult = row_data.percent_value * 0.01;
            let flCorrResult = math.max(0, row_data.correct_value * 0.01);
            let flResult = math.floor((flBaseValue + flAddResult) * flPercentResult * flMulResult * flCorrResult);
            return flResult
        }
        return flBaseValue
    }

    /** 获取特殊型字段值 */
    GetTypesAffixSpecialValue<T1 extends keyof typeof SpecialvalueOfTableSpecialObject, T2 extends keyof typeof SpecialvalueOfTableSpecialObject[T1]>(
        skv_affix: T1, skv_key: T2
    ) {
        if (this.custom_ability_types == null) { return [] }
        let skv_type = this.custom_ability_types.skv_type[skv_affix];
        if (!skv_type) { return [] }
        let skv_key_list = SpecialvalueOfTableSpecialObject[skv_affix][skv_key];
        let value_list: number[] = [];
        for (let _key in skv_key_list) {
            let value = this.GetTypesAffixValue(0, skv_affix, _key as any);
            value_list.push(value)
        }
        return value_list
    }

    GetSpecialValueForTypes
        <T1 extends keyof SpecialvalueOfTableProps, T2 extends keyof SpecialvalueOfTableProps[T1]>(
            name: string,
            skv_affix: T1,
            skv_key: T2
        ): number {
        return this.GetTypesAffixValue(this.GetSpecialValueFor(name), skv_affix, skv_key)
    }

    SetCustomAbilityType(type_key: CustomHeroAbilityTypes, type_state: boolean) {
        if (type_key == 'Null') { return }
        if (this.custom_ability_types.skv_type[type_key] != type_state) {
            this.custom_ability_types.skv_type[type_key] = type_state;
            CustomNetTables.SetTableValue(
                "custom_ability_types",
                `${this.GetEntityIndex()}`,
                this.custom_ability_types
            );
        }
    }

    GetCustomAbilityType() {
        let type_list: CustomHeroAbilityTypes[] = [];
        for (let _key in this.custom_ability_types.skv_type) {
            let type_key = _key as CustomHeroAbilityTypes
            let type_state = this.custom_ability_types.skv_type[type_key];
            if (type_state) {
                type_list.push(type_key)
            }
        }
        return type_list
    }
    /** 增加元素 */
    AddCustomAbilityElement(element_key: ElementTypes, type_state: boolean = true) {
        let index = this.custom_ability_types.element_type.indexOf(element_key);
        if (index == -1 && type_state) {
            this.custom_ability_types.element_type.push(element_key);
            CustomNetTables.SetTableValue(
                "custom_ability_types",
                `${this.GetEntityIndex()}`,
                this.custom_ability_types
            );
        }
    }

    /** 获取存档技能等级特殊效果 */
    GetServerSkillEffect(key: string, input_value: number) {
        let skill_level_ojbect = GameRules.ServiceInterface.PlayerServerSkillTypeLevel[this.player_id];
        if (skill_level_ojbect == null || skill_level_ojbect[key] == null) { return 0 }
        let test_mode = true;
        let ss_level = skill_level_ojbect[key].lv;
        let ability_types = this.custom_ability_types.skv_type
        if ((ability_types.Targeting && ss_level > 0) || test_mode) {
            if (key == "21") {
                //  21	目标·命运	目标型技能根据释放时的额外目标数量，提升技能伤害55%*额外目标数
                return input_value * 55
            }
        }

        return 0


    }

    GetTalentKv(talent_key: string, talent_special: string) {
        // GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, this.hero_talent, "", "bonus_value");
    }

    ManaCostAndConverDmgBonus() {
        let cost_mana = this.GetManaCost(-1);
        this.UseResources(true, true, true, true)
        if (this.caster.rune_passive_type && this.caster.rune_passive_type["rune_4"]) {
            let max_mana = this.caster.GetMaxMana();
            let cost_percent = math.floor((100 * cost_mana) / max_mana);
            let value = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_4", "value")
            print("has rune_4", 'cost_percent', cost_percent, 'value', value)
            return value * cost_percent
        }
        return 0
    }
    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: ProjectileExtraData): void | boolean {

    }
}


export class BaseHeroModifier extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability: BaseHeroAbility;
    ability_damage: number;
    fakeAttack: boolean = false;
    tracking_proj_name: string = "";

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.element_type = ElementTypes.NONE;
        this.damage_type = DamageTypes.PHYSICAL
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility() as BaseHeroAbility;
        this.ability_damage = 0;
        this.ability.IntrinsicMdf = this;
        this.tracking_proj_name = G_PorjTrack.none;
        this.SetStackCount(0)
        this.C_OnCreated();
        this.OnRefresh(params)
        this.StartIntervalThink(0.1)
    }

    C_OnCreated(): void {

    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        // print("OnRefresh")
        this.UpdataAbilityValue();
        this.UpdataSpecialValue();
    }

    /** 技能的Ability更新 */
    UpdataAbilityValue() { }
    /** 技能的特殊词条更新 */
    UpdataSpecialValue() { }

    OnIntervalThink(): void { }

    PlayEffect(params: PlayEffectProps) { }

    /** 使用技能 */
    DoExecutedAbility() {
        let buff = this.caster.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
        if (buff) {
            buff.Rune_ExecutedAbility({})
        }
    }


}

const SpecialvalueOfTableSpecialObject = {

    Targeting: {
        skv_targeting_multiple: {
            skv_targeting_multiple1: 0,
            skv_targeting_multiple2: 0,
            skv_targeting_multiple3: 0,
        }
    }
}