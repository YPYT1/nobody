

/** 任务基础模版 */
export class MissionModule {

    vMapCenter: Vector;
    mission_name: string;
    /** 任务阵营 `1`天辉 `2`夜宴*/
    mission_type: number; // 1天辉 2夜宴
    /** 任务状态 `-1`进行中 `0`失败 `1`成功 */
    mission_state: number;
    the_npc: CDOTA_BaseNPC;
    countdown_thinker: CDOTA_BaseNPC;
    /** 当前进度 */
    progress_value: number;
    /** 进度上限 */
    progress_max: number;
    is_stop: boolean;
    /** 任务限时 */
    limit_time: number;
    /** 任务接取点 */
    pick_points: Vector;
    mdf_thinker: CDOTA_BaseNPC
    start_thinker: CDOTA_BaseNPC;
    units: CDOTA_BaseNPC[] = [];
    is_test: boolean;
    start_npc: CDOTA_BaseNPC;

    constructor(name: string, mission_type: number) {
        this.mission_name = name;
        this.mission_type = mission_type;
        this.units = []
        this.InitEventConfig()
    }

    /** 初始化d当前配置 */
    InitEventConfig() {

    }

    CreateCountdownThinker(countdown: number) {
        this.countdown_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_thinker_countdown",
            {
                duration: countdown,
                mission_type: this.mission_type,
            },
            Vector(0, 0, 0),
            DotaTeam.GOODGUYS,
            false
        )

    }

    GetMissionName() {
        return this.mission_name
    }

    // 创建任务光圈
    CreateMission(vPos: Vector, vMapCenter: Vector, is_test: boolean) {
        this.is_test = is_test;
        this.is_stop = false;
        this.units = [];
        this.vMapCenter = vMapCenter;
        let hHero = PlayerResource.GetSelectedHeroEntity(0);
        hHero.RemoveModifierByName("modifier_state_movetips")
        hHero.AddNewModifier(hHero, null, "modifier_state_movetips", {
            duration: 30,
            x: vPos.x,
            y: vPos.y,
            z: vPos.z,
        })

        this.start_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_thinker",
            {
                mission_name: this.mission_name,
                mission_type: this.mission_type,
            },
            vPos,
            DotaTeam.GOODGUYS,
            false
        )
        if (this.mission_type == 1) {
            this.start_npc = CreateUnitByName("npc_mission_npc_radiant", vPos, false, null, null, DotaTeam.GOODGUYS)
        } else {
            this.start_npc = CreateUnitByName("npc_mission_npc_dire", vPos, false, null, null, DotaTeam.GOODGUYS)
        }
        this.start_npc.AddNewModifier(this.start_npc, null, "modifier_mission_npc", {})

        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "任务 {s:mission_name} 出现!",
            {
                mission_name: this.mission_name,

            }
        )
    }

    RemoveMoveTips() {
        // 移除tips
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName("modifier_state_movetips")
        }
    }

    AddMoveTips(vPos: Vector, duration: number) {
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.RemoveModifierByName("modifier_state_movetips")
            hHero.AddNewModifier(hHero, null, "modifier_state_movetips", {
                duration: duration,
                x: vPos.x,
                y: vPos.y,
                z: vPos.z,
            })
        }
    }

    GetToNextPoints(vStart: Vector, fDistance: number) {
        let direction = (vStart - this.vMapCenter as Vector).Normalized()
        let next_pos = vStart + direction * fDistance * -1 as Vector;
        return RotatePosition(vStart, QAngle(0, RandomInt(-45, 45), 0), next_pos)
    }

    // 接取任务
    Receive() { }

    /** 开始任务 */
    StartTheMission(start: Vector) {
        if (this.start_npc) {
            UTIL_Remove(this.start_npc)
            this.start_npc = null
        }
        // if (IsValid(this.start_npc)) { UTIL_Remove(this.start_npc) }
        this.ExecuteLogic(start)
    }
    // 执行任务相关内容
    ExecuteLogic(start: Vector) { }

    /** 增加进度值 */
    AddProgressValue(value: number) { }

    /** 任务结束 */
    EndOfMission(success: boolean) {
        this.RemoveMoveTips()
        this.CleanMissionData()
        if (this.is_stop == false) {
            GameRules.CMsg.SendCommonMsgToPlayer(
                -1,
                "{s:mission_name} 任务 {s:success}",
                {
                    mission_name: this.mission_name,
                    success: success ? "ok" : "fail"
                }
            )
            if (success) {
                this.GetReward()
            }
            // 任务结束后进行下一个任务
            if (this.is_test == false) {
                if (this.mission_type == 1) {
                    GameRules.MissionSystem.StartRadiantMissionLine()
                } else if (this.mission_type == 2) {
                    GameRules.MissionSystem.StartDireMissionLine()
                }
            }

            this.is_stop = true
        }


    }

    /** 清空当前任务相关数据 */
    CleanMissionData() {
        // 移除NPC
        print("CleanMissionData", this.mission_name)
        if (this.mdf_thinker) {
            UTIL_Remove(this.mdf_thinker)
            this.mdf_thinker = null
        }
        if (this.start_npc) {
            UTIL_Remove(this.start_npc)
            this.start_npc = null
        }
        if (this.countdown_thinker) {
            UTIL_Remove(this.countdown_thinker)
            this.countdown_thinker = null
        }
        for (let unit of this.units) {
            if (unit || IsValid(unit)) {
                UTIL_Remove(unit)
            }
        }
        this.units = []
    }

    /** 任务时间到期 */
    MissionOverTime() { }

    /** 任务终止 */
    StopCurrentMission() {
        this.is_stop = true;
        // print("StopCurrentMission",this.mission_name)
        this.RemoveMoveTips()
        this.CleanMissionData()
        if (this.start_thinker) {
            UTIL_Remove(this.start_thinker)
        }
        print("当前任务终止")
    }

    SendMissionProgress() {
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "{s:mission_name} 任务进度{d:progress_value} / {d:progress_max}",
            {
                mission_name: this.mission_name,
                progress_value: this.progress_value,
                progress_max: this.progress_max,
            }
        )
    }

    /** 任务奖励 */
    GetReward() {
        if (this.mission_type == 1) {
            this.RewardOfRadiant();
        } else {
            this.RewardOfDire()
        }
    }

    /** 天辉奖励 */
    RewardOfRadiant() {
        // 天辉任务：每名玩家获得500灵魂，一次符文选择机会。
        for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
            GameRules.ResourceSystem.ModifyResource(i, {
                "Soul": 500
            })
        }
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "完成天辉任务{s:mission_name} 获得 {d:soul}灵魂",
            {
                mission_name: this.mission_name,
                soul: 500,
            }
        )


    }

    /** 夜魇奖励 */
    RewardOfDire() {
        // 夜魇任务：每名玩家获得1000灵魂，一次符文选择机会。
        for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
            GameRules.ResourceSystem.ModifyResource(i, {
                "Soul": 1000
            })
        }
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "完成夜宴任务{s:mission_name} 获得 {d:soul}灵魂",
            {
                mission_name: this.mission_name,
                soul: 1000,
            }
        )
    }

}