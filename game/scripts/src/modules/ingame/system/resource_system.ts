
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";

type PlayerResourceInput = {
    [key in PlayerResourceTyps]?: number
}
/**
 * 资源系统
 */
@reloadable
export class ResourceSystem extends UIEventRegisterClass {

    /** 玩家资源 */
    player_resource: { [key in PlayerResourceTyps]: number }[] = [];
    /** 资源获取率 */
    player_acquisition_rate: { [key in PlayerResourceTyps]: number }[] = [];
    /** 资源消耗率 */
    player_cost_rate: { [key in PlayerResourceTyps]: number }[] = [];
    /** 上次更新 */
    last_updatetime: number[] = [];

    constructor() {
        super("ResourceSystem")
        this.InitAllPlayer()
    }

    /** 初始化资源 */
    InitAllPlayer(player_counts: number = 4) {
        this.player_resource = [];
        this.player_acquisition_rate = [];
        this.player_cost_rate = [];
        this.last_updatetime = [];
        for (let i = 0 as PlayerID; i < player_counts; i++) {
            this.player_resource.push({
                Gold: 0,
                Soul: 0,
                Kills: 0,
                TeamExp: 0,
                SingleExp: 0,
            });
            this.player_acquisition_rate.push({
                Gold: 100,
                Soul: 100,
                Kills: 100,
                TeamExp: 100,
                SingleExp: 100,
            })
            this.player_cost_rate.push({
                Gold: 100,
                Soul: 100,
                Kills: 100,
                TeamExp: 100,
                SingleExp: 100,
            })
            this.last_updatetime.push(0);
            this.SendPlayerResource(i)
        }

    }

    /**
     * 修改资源 
     * @param player_id 
     * @param resource_input 
     * @param overhead_target 
     * @param bSound 
     * @param bFixed 
     * @param bIgnoring 
     * @returns 
     */
    ModifyResource(
        player_id: PlayerID,
        resource_input: PlayerResourceInput,
        overhead_target?: CDOTA_BaseNPC,
        bSound: boolean = false, // 播放声音
        bFixed: boolean = false, // 固定资源,不吃其他加成
        bIgnoring: boolean = false, // 无视条件,为真则能把资源扣成负数
        // bIsSell: boolean = false, // 是否为出售
    ) {
        if (player_id == -1) { return { status: false, msg: "player = -1", } }
        let ret: { status: boolean, msg: string } = { status: true, msg: "", };
        for (let [resource, amount] of pairs(resource_input)) {
            amount = math.ceil(amount);
            // 不为固定,且不无视
            if (amount < 0) {
                if (bIgnoring == false) {
                    // 扣除
                    if (bFixed == false) {
                        amount = amount * this.player_cost_rate[player_id][resource] * 0.01
                    }
                    const res_check = math.abs(amount) <= this.player_resource[player_id][resource];
                    if (res_check == false) {
                        // DeepPrintTable(this.player_resource[player_id])
                        // print("resource not enough type==>", resource)
                        // 未满足条件,所以
                        ret.status = false;
                        ret.msg = `[${resource}]:not enough`
                        return ret
                    }
                }
            }
        }

        for (let [resource, amount] of pairs(resource_input)) {
            if (bFixed == false) {
                if (amount > 0) {
                    amount = amount * this.player_acquisition_rate[player_id][resource] * 0.01
                } else {
                    amount = amount * this.player_cost_rate[player_id][resource] * 0.01
                }
            }
            this.player_resource[player_id][resource] += math.ceil(amount);
            if (resource == "SingleExp") {
                // 增加个人英雄经验
                this.AddExperience(player_id, math.ceil(amount))
            } else if (resource == "TeamExp") {
                // 团队经验
                for (let hHero of HeroList.GetAllHeroes()) {
                    this.AddExperience(hHero.GetPlayerID(), math.ceil(amount))
                }
            }
        }

        let update_status = GameRules.GetDOTATime(false, false) > this.last_updatetime[player_id];
        if (update_status) {
            this.SendPlayerResource(player_id);
            this.last_updatetime[player_id] = GameRules.GetDOTATime(false, false) + 0.2;
        } else {
            GameRules.GetGameModeEntity().SetContextThink("ResourceUpdate_" + player_id, () => {
                this.SendPlayerResource(player_id);
                this.last_updatetime[player_id] = GameRules.GetDOTATime(false, false) + 0.2;
                return null;
            }, 0.2);
        }

        return ret
    }

    AddExperience(player_id: PlayerID, base_exp: number) {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hHero.AddExperience(base_exp, ModifyXpReason.CREEP_KILL, false, false)
    }

    SendPlayerResource(player_id: PlayerID) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ResourceSystem_SendPlayerResources",
            {
                data: this.player_resource[player_id]
            }
        );
    }

    /**
     * 修改资源获取率
     * @param player_id 
     * @param resource 
     * @param value 
     */
    ModifyAcquisitionRate(player_id: PlayerID, resource: PlayerResourceTyps, value: number) {
        this.player_acquisition_rate[player_id][resource] += value
    }

    /**
     * 修改资源消耗率
     * @param player_id 
     * @param resource 
     * @param value 
     */
    ModifyCostRate(player_id: PlayerID, resource: PlayerResourceTyps, value: number) {
        this.player_cost_rate[player_id][resource] += value
    }

    DropResourceItem(resource: PlayerResourceTyps, vPos: Vector, iCount: number) {
        let exp_unit = CreateUnitByName("npc_exp", vPos, false, null, null, DotaTeam.GOODGUYS)
        // EmitSoundOn("Custom.ItemDrop", exp_unit)
        exp_unit.SetMaterialGroup(`${RandomInt(0, 2)}`)
        exp_unit.is_picking = false;
        exp_unit.AddNewModifier(exp_unit, null, "modifier_generic_arc_lua", {
            speed: 250,
            distance: 0,
            duration: 0.5,
            height: 150,
            // activity: GameActivity.DOTA_STUN_STATUE,
            // isStun: 1,
        })
        exp_unit.drop_resource_type = resource;
        exp_unit.drop_resource_amount = iCount;
        exp_unit.AddNewModifier(exp_unit, null, "modifier_pickitem_exp", {
            duration: 10
        })
    }

    RemoveAllDropItem() {
        let hDropItemList = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            Vector(0, 0, 0),
            null,
            9999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        for (let hItem of hDropItemList) {
            UTIL_Remove(hItem)
        }
    }
    GetPlayerResource(player_id: PlayerID) {
        this.SendPlayerResource(player_id)
    }
}