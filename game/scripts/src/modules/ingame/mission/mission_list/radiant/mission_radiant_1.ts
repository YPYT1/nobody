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
    /** 门框半径 */
    goal_radius: number = 250;
    /** 任务限时 */
    limit_time = 60;


    ExecuteLogic(vect: Vector) {
        this.limit_time = 60;
        this.progress_value = 0;
        this.progress_max = 1
        this.mission_state = -1;
        this.start_vect = vect;
        this.units = [];
        this.SendMissionProgress();
        // 创建终点
        let goal_vect = this.GetFoolballGoalVect(vect);
        this.CreateFootballGoal(goal_vect);
        this.CreateFootball(this.start_vect, goal_vect)
        if (PlayerResource.GetPlayerCount() > 2) {
            this.progress_max += 1
            this.CreateFootball(this.start_vect, goal_vect)
        }

        this.CreateCountdownThinker(this.limit_time)
    }


    /** 创建足球 */
    CreateFootball(vect: Vector, goal_vect: Vector) {
        let rand_vect = vect + RandomVector(200) as Vector
        let football = CreateUnitByName("npc_football", rand_vect, false, null, null, DotaTeam.GOODGUYS);
        // 添加门框指示线
        // football.AddNewModifier(football, null, "modifier_basic_countdown", { duration: this.limit_time })
        football.AddNewModifier(football, null, "modifier_mission_radiant_1_football", {
            goal_x: goal_vect.x,
            goal_y: goal_vect.y,
            goal_z: goal_vect.z,
            goal_radius: this.goal_radius,
            duration: this.limit_time,
        })
        
        this.units.push(football)
    }

    /** 创建足球终点 */
    CreateFootballGoal(vect: Vector) {
        this.mdf_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_radiant_1_football_goal",
            {
                duration: this.limit_time,
                goal_radius: this.goal_radius,
            },
            vect,
            DotaTeam.GOODGUYS,
            false
        )

        return this.mdf_thinker.GetAbsOrigin()
    }

    GetFoolballGoalVect(vStart: Vector): Vector {
        // 门框的位置必须要单位能移动到
        let direction = (vStart - this.vMapCenter as Vector).Normalized()
        let next_pos = vStart + direction * -3000 as Vector;
        let final = RotatePosition(vStart, QAngle(0, RandomInt(-45, 45), 0), next_pos)
        return final
    }

    AddProgressValue(value: number): void {
        this.progress_value += value;
        // 进度提示
        this.SendMissionProgress();
        // 成功条件
        if (this.progress_value >= this.progress_max) {
            this.mission_state = 1
            this.EndOfMission(true)
        }
    }

    MissionOverTime(): void {
        if(this.mission_state == -1){
            this.EndOfMission(false)
        }
    }

}