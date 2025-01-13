import { reloadable } from "../../utils/tstl-utils";
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";

/** 游戏基础规则 */
@reloadable
export class BasicRules extends UIEventRegisterClass {

    last_acc_thinker: CDOTA_BaseNPC[] = [];

    constructor() {
        super("BasicRules");
    }

    MoveState(player_id: PlayerID, params: CGED["BasicRules"]["MoveState"]) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let Direction = params.Direction;
        let State = params.State;
        hHero.AddNewModifier(hHero, null, "modifier_basic_move", {
            [Direction]: State
        })
    }

    /** 治疗触发 */
    Heal(hCaster: CDOTA_BaseNPC, fHealAmount: number, hAbility?: CDOTABaseAbility) {
        hCaster.Heal(fHealAmount, hAbility);

        // hCaster.HealWithParams()
        let effect_fx = ParticleManager.CreateParticle(
            "particles/generic_gameplay/generic_lifesteal.vpc",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            hCaster
        )
        ParticleManager.ReleaseParticleIndex(effect_fx)
    }

    /** 回蓝 */
    RestoreMana(hCaster: CDOTA_BaseNPC, fManaAmount: number, hAbility?: CDOTABaseAbility) {
        if (fManaAmount < 0) {
            hCaster.Script_ReduceMana(math.abs(fManaAmount), hAbility)
        } else {
            hCaster.GiveMana(fManaAmount)
        }
    }


    /**
     * 扣除生命
     * @param hCaster 
     * @param fAmount 
     * @param bInjured 
     */
    CostHealth(hCaster: CDOTA_BaseNPC, fAmount: number, bInjured: boolean = false) {
        hCaster.SetHealth(hCaster.GetHealth() - fAmount)
    }


    PickAllExp(hUnit: CDOTA_BaseNPC) {
        let ExpItems = FindUnitsInRadius(
            DotaTeam.NEUTRALS,
            hUnit.GetAbsOrigin(),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        for (let ExpItem of ExpItems) {
            if (ExpItem.GetUnitName() == "npc_exp") {
                if (!ExpItem.HasModifier("modifier_pick_animation")) {
                    // 无敌状态只能自己给自己上BUFF
                    ExpItem.AddNewModifier(ExpItem, null, "modifier_pick_animation", {
                        picker: hUnit.entindex(),
                    })
                }
            }
        }
    }

    CreateRoundAcceleration() {
        // print("CreateRoundAcceleration")
        this.RemoveRoundAcceleration()
        let x = GameRules.MapChapter.ChapterData.map_centre_x;
        let y = GameRules.MapChapter.ChapterData.map_centre_y;
        let vOrigin = Vector(x, y, 128);
        const last_acc_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_creature_acceleration_thinker",
            {
                duration: 60,
            },
            vOrigin,
            DotaTeam.BADGUYS,
            false
        )

        this.last_acc_thinker.push(last_acc_thinker)
    }

    RemoveRoundAcceleration() {
        // print("RemoveRoundAcceleration")
        for (let acc_thinker of this.last_acc_thinker) {
            UTIL_Remove(acc_thinker)
        }
        this.last_acc_thinker = []
    }

    // boss（数量）*500 金币、经验；符文选择机会一次
    BossChestDrop(vPos: Vector, boss_wave: number) {
        const chestUnit = CreateUnitByName(
            "npc_public_treasure_chest",
            vPos,
            false,
            null,
            null,
            DotaTeam.GOODGUYS
        );
        chestUnit.AddNewModifier(chestUnit, null, "modifier_publice_treasure_chest", {
            boss_wave: boss_wave
        })
    }

    BossChestReward(boss_wave: number) {
        // Boss奖励=boss（数量）*500 金币、经验；符文选择机会一次。
        let gold = boss_wave * 500;
        let exp = boss_wave * 500;

        for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
            GameRules.ResourceSystem.ModifyResource(i, {
                SingleExp: exp,
                Soul: gold,
            })
        }
        GameRules.RuneSystem.GetRuneSelectToAll();


    }
}