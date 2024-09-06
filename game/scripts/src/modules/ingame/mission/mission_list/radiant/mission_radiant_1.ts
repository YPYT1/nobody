import { MissionModule } from "../_mission_module";

/**
 * 踢足球	
 * 【天辉的考验】：根据玩家数量，玩家人数≤2时，在原地生成一个足球，玩家需要推动足球到指定的光圈内，即可完成任务。
 * 玩家数量＞2时，生成两个足球。所有足球进入指定地点才为任务完成。
目标区域范围：半径250码。距离接取任务点最小距离3000码，最大3500码。光圈随机生成位置
任务限时：60秒
失败条件：超时、所有玩家阵亡。"

 */
export class Mission_Radiant_1 extends MissionModule {


    start_vect: Vector;
    path_check_count: number;

    /** 进球数量 */
    goal_count: number;
    goal_max: number;

    /** 门框半径 */
    goal_radius: number = 250;
    goal_mdf: CDOTA_Buff;

    /** 任务限时 */
    limit_time = 60;


    ExecuteLogic(vect: Vector) {

        this.start_vect = vect;

        this.path_check_count = 0;

        // 创建终点
        // let rand_vect = this.start_vect + RandomVector(RandomInt(2000, 2500)) as Vector
        let goal_vect = this.GetFoolballGoalVect(vect);
        let final_vect = this.CreateFootballGoal(goal_vect);

        this.goal_count = 0;
        this.goal_max = 1
        this.CreateFootball(this.start_vect, final_vect)
        if (PlayerResource.GetPlayerCount() > 2) {
            this.goal_max += 1
            this.CreateFootball(this.start_vect, final_vect)
        }

        // 是否有定时器
        this.StateChangeThink()

    }

    StateChangeThink() {
        let time = 0;
        GameRules.GetGameModeEntity().SetContextThink("StateChangeThink", () => {
            if (this.limit_time == null) { return null }
            time += 1;
            if (time >= this.limit_time) {
                // 任务失败
                return null
            }
            return 1
        }, 0);


    }

    /** 创建足球 */
    CreateFootball(vect: Vector, goal_vect: Vector) {
        let rand_vect = vect + RandomVector(200) as Vector
        let football = CreateUnitByName("npc_football", rand_vect, false, null, null, DotaTeam.NEUTRALS);
        // 添加门框指示线
        football.AddNewModifier(football, null, "modifier_mission_mdf_1_football", {
            goal_x: goal_vect.x,
            goal_y: goal_vect.y,
            goal_z: goal_vect.z,
            goal_radius: this.goal_radius,
        })
    }

    /** 创建足球终点 */
    CreateFootballGoal(vect: Vector) {
        let football_goal = CreateUnitByName("npc_football_goal", vect, false, null, null, DotaTeam.NEUTRALS);
        this.goal_mdf = football_goal.AddNewModifier(football_goal, null, "modifier_mission_mdf_1_football_goal", {
            goal_radius: this.goal_radius,
        })
        this.the_npc = football_goal
        return football_goal.GetAbsOrigin()
    }

    GetFoolballGoalVect(vStart: Vector): Vector {
        // 门框的位置必须要单位能移动到
        // let path_check = GridNav.CanFindPath(this.map_center, vect);
        // // let path2 = GridNav.IsTraversable(vect);
        // // let is_blocked = GridNav.IsBlocked(vect)
        // if (path_check) {
        //     return vect
        // }
        // this.path_check_count += 1;
        // let rand_vect: Vector;
        // if (this.path_check_count >= 60) {
        //     // 如果超过60次都没有找到合适点,则在地图中心点放置
        //     rand_vect = this.map_center + RandomVector(200) as Vector
        // } else {
        //     rand_vect = this.start_vect + RandomVector(RandomInt(3000, 3500)) as Vector
        // }
        // return this.GetFoolballGoalVect(rand_vect)

        //
        let direction = (vStart - this.vMapCenter as Vector).Normalized()
        let next_pos = vStart + direction * -3000 as Vector;
        let final = RotatePosition(vStart, QAngle(0, RandomInt(-45, 45), 0), next_pos)

        return final
    }


    AddProgressValue(value: number): void {
        this.goal_count += value;
        // 进度提示
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "{s:mission_name} 任务进度{d:goal_count} / {d:goal_max}",
            {
                mission_name: "m1",
                goal_count: this.goal_count,
                goal_max: this.goal_max,
            }
        )
        // 成功条件
        if (this.goal_count >= this.goal_max) {
            this.EndOfMission(true)
        }
    }

    EndOfMission(success: boolean) {
        // 移除NPC
        if (this.the_npc) {
            UTIL_Remove(this.the_npc)
            this.the_npc = null
        }

        if (success) {
            // m1 成功
            this.GetReward()
        }


    }

}