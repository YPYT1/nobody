// 创建警告标记
import { reloadable } from "../../../utils/tstl-utils";
//宝物系统

type LineWarningType = "1s" | "2s" | "3s";

@reloadable
export class WarningMarker {

    /**
     * 创建圆形范围警告提示
     * @param radius 
     * @param duration 
     * @param vect 
     * @param color
     */
    Circular(
        radius: number,
        duration: number,
        vect: Vector,
        immediateRelease: boolean = false,
        color: Vector = Vector(255, 0, 0),
        type: number = 0,
    ) {
        let effect_name = "particles/diy_particles/warning_aoe/ui_sphere.vpcf";
        if (type == 1) {
            effect_name = "particles/diy_particles/warning_aoe/ui_sphere_reverse.vpcf";
        }
        let aoe_pfx2 = ParticleManager.CreateParticle(
            effect_name,
            ParticleAttachment.CUSTOMORIGIN,
            null,
        );
        ParticleManager.SetParticleControl(aoe_pfx2, 0, vect);
        ParticleManager.SetParticleControl(aoe_pfx2, 1, Vector(duration, radius + 25, 0));
        ParticleManager.SetParticleControl(aoe_pfx2, 2, color);
        if (immediateRelease) {
            ParticleManager.ReleaseParticleIndex(aoe_pfx2);
        }
        return aoe_pfx2;
    }

    /**
     * 创建直线提示
     * @param caster 施法者
     * @param line_radius 直线宽度
     * @param start_vect 开始点
     * @param end_vect 结束点
     * @param distance 直线长度 不为-1时为两点之间的长度
     * @param color 颜色
     * @returns 
     */
    Line(
        caster: CDOTA_BaseNPC,
        line_width: number,
        start_vect: Vector,
        target_vect: Vector,
        distance: number = -1,
        duration: number = -1,
        color: Vector = Vector(255, 0, 0),
    ) {
        // particles/diy_particles/range_finder_cone.vpcf
        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/range_finder_cone.vpcf",
            ParticleAttachment.POINT,
            caster,
        );
        ParticleManager.SetParticleControl(line_pfx, 0, caster.GetOrigin());
        // ParticleManager.SetParticleControl(line_pfx, 1, caster.GetOrigin());
        ParticleManager.SetParticleControl(line_pfx, 2, Vector(duration, 0, 0));
        ParticleManager.SetParticleControl(line_pfx, 3, Vector(line_width, line_width, 0));
        ParticleManager.SetParticleControl(line_pfx, 4, color);
        if (distance != -1) {
            let direction = target_vect - start_vect as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            let vPoint = start_vect + direction * distance as Vector;
            ParticleManager.SetParticleControl(line_pfx, 1, vPoint);
        } else {
            ParticleManager.SetParticleControl(line_pfx, 1, target_vect);
        }
        return line_pfx;
    }

    /**
     * 变更直线终点
     * @param line_pfx 
     * @param end_vect 
     */
    UpdateLine(
        line_pfx: ParticleID,
        start_vect: Vector,
        target_vect: Vector,
        distance: number = -1,
        color?: Vector,
    ) {
        if (distance == -1) {
            ParticleManager.SetParticleControl(line_pfx, 2, target_vect);
        } else {
            let direction = target_vect - start_vect as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            let vPoint = start_vect + direction * distance as Vector;
            ParticleManager.SetParticleControl(line_pfx, 2, vPoint);
            if (color) {
                ParticleManager.SetParticleControl(line_pfx, 4, color);
            }

        }

    }

    FixLine(
        caster: CDOTA_BaseNPC,
        line_radius: number,
        start_vect: Vector,
        target_vect: Vector,
        distance: number = -1,
        ver: LineWarningType = "1s"
    ) {
        let line_pfx = ParticleManager.CreateParticle(
            `particles/diy_particles/warning_line/warning_line_fix_${ver}.vpcf`,
            ParticleAttachment.WORLDORIGIN,
            caster,
        );
        ParticleManager.SetParticleControl(line_pfx, 0, caster.GetOrigin());
        ParticleManager.SetParticleControl(line_pfx, 1, caster.GetOrigin());
        ParticleManager.SetParticleControl(line_pfx, 3, Vector(line_radius, line_radius, 0));
        ParticleManager.SetParticleControl(line_pfx, 4, Vector(255, 255, 255));
        if (distance != -1) {
            let direction = target_vect - start_vect as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            let vPoint = start_vect + direction * distance as Vector;
            ParticleManager.SetParticleControl(line_pfx, 2, vPoint);
        } else {
            ParticleManager.SetParticleControl(line_pfx, 2, target_vect);
        }
        return line_pfx;
    }

    /** 变更线条颜色 */
    UpdateLineColor(line_pfx: ParticleID, color: Vector = Vector(255, 0, 0),) {
        ParticleManager.SetParticleControl(line_pfx, 4, color);
    }



    /**
     * 扇形范围,不超过
     * @param caster 施法者
     * @param start_vect 开始点
     * @param end_vect 结束点
     * @param angle 角度
     * @param distance 距离
     * @param color 颜色
     * @param duration 时间
     * @returns 
     */
    Sector(
        caster: CDOTA_BaseNPC,
        start_vect: Vector,
        end_vect: Vector,
        angle: number,
        distance: number,
        duration: number = 1,
        color: Vector = Vector(255, 0, 0),
    ) {
        // 通过开始点,结束点,角度,来得到 结束时候的radius
        let end_radius = math.tan((angle) * math.pi / 360) * distance;
        // let end_radius2 = distance * 3.14 * (360 / angle)
        // print("end_radius",end_radius,end_radius2)
        // 因为特效问题,需要多偏移50的距离
        let vDir = (end_vect - start_vect as Vector)
        let vTarget = start_vect + vDir.Normalized() * (distance + 100) as Vector;
        let warning_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/warning_sector/warning_sector2.vpcf",
            ParticleAttachment.WORLDORIGIN,
            caster,
        );
        ParticleManager.SetParticleControl(warning_fx, 0, start_vect);
        ParticleManager.SetParticleControl(warning_fx, 1, vTarget);
        ParticleManager.SetParticleControl(warning_fx, 2, Vector(0, end_radius, 0));
        ParticleManager.SetParticleControl(warning_fx, 3, Vector(duration, 0, 0));
        // // 颜色
        ParticleManager.SetParticleControl(warning_fx, 4, color);
        return warning_fx;
    }

    /**
     * 创建扇形警告
     * @param caster 施法者
     * @param target_vect 目标点
     * @param start_radius 开始宽度
     * @param end_radius 结束宽度
     * @param distance 距离长度 -1则为目标点,否则为长度
     * @param duration 持续时间
     * @returns 
     */
    CreateSectorV2(
        caster: CDOTA_BaseNPC,
        target_vect: Vector,
        start_radius: number,
        end_radius: number,
        distance: number = -1,
        duration: number = -1,
    ) {
        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/warning_sector.vpcf",
            ParticleAttachment.WORLDORIGIN,
            caster,
        );
        ParticleManager.SetParticleControl(line_pfx, 0, caster.GetOrigin());
        ParticleManager.SetParticleControl(line_pfx, 1, caster.GetOrigin());
        ParticleManager.SetParticleControl(line_pfx, 3, Vector(end_radius, start_radius, 0));
        ParticleManager.SetParticleControl(line_pfx, 4, Vector(255, 255, 255));
        if (distance != -1) {
            let start_vect = caster.GetOrigin();
            let direction = target_vect - start_vect as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            let vPoint = start_vect + direction * distance as Vector;
            ParticleManager.SetParticleControl(line_pfx, 2, vPoint);
        } else {
            ParticleManager.SetParticleControl(line_pfx, 2, target_vect);
        }
        return line_pfx;
    }

    TestEffect(hUnit: CDOTA_BaseNPC, vPoint: Vector, fRadius: number = 360) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/econ/events/fall_2021/blink_dagger_fall_2021_end.vpcf",
            ParticleAttachment.WORLDORIGIN,
            hUnit,
        );
        ParticleManager.SetParticleControl(effect_fx, 0, vPoint);
        ParticleManager.ReleaseParticleIndex(effect_fx);
        // 
    }

    TestEffectInModifier(Buff: CDOTA_Buff, fRadius: number = 360) {
        let hParent = Buff.GetParent();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_leshrac/leshrac_split_earth.vpcf",
            ParticleAttachment.WORLDORIGIN,
            hParent
        );
        ParticleManager.SetParticleControl(effect_fx, 0, hParent.GetOrigin());
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(fRadius, 1, 1));
        Buff.AddParticle(effect_fx, false, false, -1, false, false);
        // ParticleManager.ReleaseParticleIndex(index);
    }

    /** 显示伤害范围 */
    DisplayRange(hParent: CDOTA_BaseNPC, fRadius: number, vColor: Vector = Vector(255, 0, 0)) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/shop_range.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            hParent
        );
        ParticleManager.SetParticleControl(effect_fx, 3, Vector(fRadius, 1, 1));
        ParticleManager.SetParticleControl(effect_fx, 4, vColor);
        return effect_fx;
    }

    CreateExclamation(hParent: CDOTA_BaseNPC) {
        let effect_fx = ParticleManager.CreateParticle(
            "particles/generic_gameplay/generic_has_quest.vpcf",
            ParticleAttachment.OVERHEAD_FOLLOW,
            hParent
        );
        return effect_fx;
    }
}