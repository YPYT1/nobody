

/** 任务基础模版 */
export class MissionModule {

    vMapCenter: Vector;
    mission_name: string;
    /** 任务阵营 */
    mission_type: number; // 1天辉 2夜宴
    the_npc: CDOTA_BaseNPC;

    constructor(name: string, mission_type: number) {
        this.mission_name = name;
        this.mission_type = mission_type;

        let ChapterData = GameRules.MapChapter.ChapterData
        this.vMapCenter = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 128);

        this.InitEventConfig()
    }

    /** 初始化d当前配置 */
    InitEventConfig() {

    }

    /**
     * 发放奖励
     * @param success 成功/失败
     */

    GiveRewards(success: boolean) {

    }

    GetMissionName() {
        return this.mission_name
    }

    // 创建任务光圈
    CreateMission(vPos: Vector) {
        let hHero = PlayerResource.GetSelectedHeroEntity(0);
        hHero.RemoveModifierByName("modifier_state_movetips")
        hHero.AddNewModifier(hHero, null, "modifier_state_movetips", {
            duration: 30,
            x: vPos.x,
            y: vPos.y,
            z: vPos.z,
        })
        CreateModifierThinker(
            null,
            null,
            "modifier_mission_thinker",
            {
                mission_name: this.mission_name,
            },
            vPos,
            DotaTeam.GOODGUYS,
            false
        )
    }

    GetToNextPoints(vStart: Vector, fDistance: number) {
        let direction = (vStart - this.vMapCenter as Vector).Normalized()
        let next_pos = vStart + direction * fDistance * -1 as Vector;
        return RotatePosition(vStart, QAngle(0, RandomInt(-45, 45), 0), next_pos)
    }
    
    // 接取任务
    Receive() { }

    // 执行任务相关内容
    ExecuteLogic(start: Vector) { }

    /** 增加进度值 */
    AddProgressValue(value: number) { }

    /** 任务结束 */
    EndOfMission(success: boolean = false) {

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
    }

    /** 夜魇奖励 */
    RewardOfDire() {
        // 夜魇任务：每名玩家获得1000灵魂，一次符文选择机会。
        for (let i = 0 as PlayerID; i < PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS); i++) {
            GameRules.ResourceSystem.ModifyResource(i, {
                "Soul": 1000
            })
        }
    }

}