
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_boss_19	演奏	
 * "蓄力3秒，立即随机给玩家分配不同颜色的音符（显示在头顶），
 * 红色音符的玩家攻击boss会受到100%反伤效果，
 * 绿色音符的玩家攻击boss会为boss回复等额生命值，
 * 黄色音符玩家攻击boss会造成双倍伤害，
 * 黑色音符玩家攻击boss会将伤害转移给平均其他玩家身上。
该过程持续20秒。音符随机且唯一，如果玩家数量大于1，保底给一个黄色音符。"
BOSS加个胜利动作持续播放
 */
@registerAbility()
export class creature_boss_19 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_boss_19"
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_state_boss_invincible", {})
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin)
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning", {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        })
        return true
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let players = PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS);
        let note: number[] = []
        if (players > 1) {
            // 保底黄
            note = [3];
            let other_note = [1, 2, 4]
            ArrayScramblingByNumber(other_note)
            for (let i = 0; i < players - 1; i++) {
                note.push(other_note[i])
            }
            ArrayScramblingByNumber(note)
        } else {
            // 纯随机
            note = [1, 2, 3, 4]
            ArrayScramblingByNumber(note)
        }

        for (let i = 0; i < note.length; i++) {
            let hHero = PlayerResource.GetSelectedHeroEntity(i as PlayerID);
            if (hHero) {
                hHero.RemoveModifierByName("modifier_creature_boss_19_note1")
                hHero.RemoveModifierByName("modifier_creature_boss_19_note2")
                hHero.RemoveModifierByName("modifier_creature_boss_19_note3")
                hHero.RemoveModifierByName("modifier_creature_boss_19_note4")
                let note_id = note[i]
                hHero.AddNewModifier(this.hCaster, this, "modifier_creature_boss_19_note" + note_id, {
                    duration: 10
                })

            }

        }
        GameRules.CMsg.BossCastWarning(true, "custom_text_boss_cast_warning_11", {})
        this.hCaster.AddNewModifier(this.hCaster, this, "modifier_creature_boss_19_channel", {})
    }

    ClearCurrentPhase(): void {
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName("modifier_creature_boss_19_note1")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note2")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note3")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note4")
        }
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName("modifier_creature_boss_19_channel")
        this.hCaster.RemoveModifierByName("modifier_state_boss_invincible_channel");
        GameRules.CMsg.BossCastWarning(false)
    }
}

@registerModifier()
export class modifier_creature_boss_19 extends BaseModifier {

    ReverseDmgPct: number
    hero_counts: number;

    OnCreated(params: object): void {
        this.ReverseDmgPct = 100 * 0.01;
        if (!IsServer()) { return }
        this.hero_counts = PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS);
    }


    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (event.attacker.HasModifier("modifier_creature_boss_19_note1")) {
            // 反弹伤害
            ApplyCustomDamage({
                victim: event.attacker,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: event.damage * this.ReverseDmgPct,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
            return 0
        } else if (event.attacker.HasModifier("modifier_creature_boss_19_note2")) {
            // 绿色音符的玩家攻击boss会为boss回复等额生命值，
            GameRules.BasicRules.Heal(this.GetCaster(), event.damage)
            return -999
        } else if (event.attacker.HasModifier("modifier_creature_boss_19_note3")) {
            // 黄色音符玩家攻击boss会造成双倍伤害，
            return 0
        } else if (event.attacker.HasModifier("modifier_creature_boss_19_note4")) {
            // 黑色音符玩家攻击boss会将伤害转移给平均其他玩家身上。
            if (this.hero_counts <= 1) { return 0 }
            // print("hero_counts",this.hero_counts)
            let damage = event.damage / (this.hero_counts - 1)
            for (let hHero of HeroList.GetAllHeroes()) {
                // print(hHero , event.attacker,hHero == event.attacker)
                if (hHero == event.attacker) { continue }
                ApplyCustomDamage({
                    victim: hHero,
                    attacker: this.GetCaster(),
                    ability: this.GetAbility(),
                    damage: damage,
                    damage_type: DamageTypes.PHYSICAL,
                    miss_flag: 1,
                })
            }
            return 0
        }
        return 0
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName("modifier_creature_boss_19_note1")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note2")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note3")
            hHero.RemoveModifierByName("modifier_creature_boss_19_note4")
        }
    }
}

// @registerModifier()
// export class modifier_creature_boss_19_channel extends BaseModifier {
//     {
//         activity = ""
//     }
// }
// 红
@registerModifier()
export class modifier_creature_boss_19_note1 extends BaseModifier {

    icon_index = 11;
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetAbsOrigin()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/title_fx/title00028/title00028.vpcf",
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.icon_index, 0, 0))
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    ShouldUseOverheadOffset(): boolean {
        return true
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CMsg.BossCastWarning(false)
    }
}

// 绿
@registerModifier()
export class modifier_creature_boss_19_note2 extends modifier_creature_boss_19_note1 {

    icon_index = 9;
}


// 黄
@registerModifier()
export class modifier_creature_boss_19_note3 extends modifier_creature_boss_19_note1 {

    icon_index = 10;
}


// 黑
@registerModifier()
export class modifier_creature_boss_19_note4 extends modifier_creature_boss_19_note1 {

    icon_index = 12;
}