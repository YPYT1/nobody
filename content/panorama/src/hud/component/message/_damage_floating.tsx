import React from 'react';
import { useGameEvent } from 'react-panorama-x';


function ImmunityEffect(event: CustomGameEventDeclarations["Function_PopupImmunityEffect"]) {

}

function DamageFloating(event: CustomGameEventDeclarations["Function_PopupNumbersToClients"]) {
    let params = event.data;
    let type = params.type;
    let entity = params.entity as EntityIndex;
    let value = params.value ?? 0;
    if (value <= 0) { return; }
    let digits = 0;
    let bIsAttack = params.IsAttack;
    let color: [number, number, number] = [255, 255, 255];
    let crit_icon = 0;
    let duration = 1;
    let effect_icon = 0;

    // let particleName = "particles/diy_particles/msg_damage.vpcf";
    if (value != null) {
        value = Math.floor(value);
        digits = String(value).length;
    }
    // 是否是元素反应
    let reaction = false;
    if (params.element_reaction) {
        reaction = true;
    }
    if (params.element_type == "fire") {
        effect_icon = 3;
        color = [255, 0, 0];
        digits += 1;
    } else if (params.element_type == "water") {
        effect_icon = 1;
        color = [0, 191, 255];
        digits += 1;
    } else if (params.element_type == "earth") {
        effect_icon = 4;
        color = [184, 134, 11];
        digits += 1;
    } else if (params.element_type == "wind") {
        effect_icon = 2;
        color = [50, 205, 50];
        digits += 1;
    }


    if (bIsAttack == 0) {
        color = [255, 0, 0];
    }

    if (params.is_crit == 1) {
        crit_icon = 1;
        digits += 1;
        duration += 0.5;
        let particleName = reaction ? "particles/ui/am2_msg_reaction_bj.vpcf" : "particles/ui/am2_msg_bj.vpcf";

        // Game.EmitSound("Hero_Mars.Shield.Crit");

        let pidx = Particles.CreateParticle(
            particleName,
            ParticleAttachment_t.PATTACH_WORLDORIGIN,
            entity
        );
        Particles.SetParticleControl(pidx, 0, Entities.GetAbsOrigin(entity));

        Particles.SetParticleControl(pidx, 3, color);
        Particles.SetParticleControl(pidx, 11, [crit_icon, value, effect_icon]);
        Particles.SetParticleControl(pidx, 12, [digits, 0, 0]);
        Particles.ReleaseParticleIndex(pidx);
    } else {
        let particleName = reaction
            ? "particles/diy_particles/msg_damage_reaction.vpcf"
            : "particles/diy_particles/msg_damage.vpcf";

        let pidx = Particles.CreateParticle(
            particleName,
            ParticleAttachment_t.PATTACH_WORLDORIGIN,
            entity
        );
        Particles.SetParticleControl(pidx, 0, Entities.GetAbsOrigin(entity));

        Particles.SetParticleControl(pidx, 1, [crit_icon, value, effect_icon]);
        Particles.SetParticleControl(pidx, 2, [duration, digits, 0]);
        Particles.SetParticleControl(pidx, 3, color);
        Particles.ReleaseParticleIndex(pidx);

    }


    // let pidx = Particles.CreateParticle(
    //     particleName,
    //     ParticleAttachment_t.PATTACH_WORLDORIGIN,
    //     entity
    // );
    // Particles.SetParticleControl(pidx, 0, Entities.GetAbsOrigin(entity));

    // Particles.SetParticleControl(pidx, 3, color);
    // Particles.SetParticleControl(pidx, 11, [crit_icon, value, effect_icon]);
    // Particles.SetParticleControl(pidx, 12, [digits, 0, 0]);

    // Particles.SetParticleControl(pidx, 1, [crit_icon, value, effect_icon]);
    // Particles.SetParticleControl(pidx, 2, [duration, digits, 0]);
    // Particles.SetParticleControl(pidx, 3, color);
}

function PopupHealth(event: CustomGameEventDeclarations["Function_PopupHealthToClients"]) {
    let data = event.data;
    let value = data.value;
    let digits = 1;
    digits += String(value).length;
    let entity = data.entity as EntityIndex;
    let health_fx = Particles.CreateParticle(
        "particles/msg_fx/msg_heal.vpcf",
        ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW,
        entity
    );
    Particles.SetParticleControl(health_fx, 0, Entities.GetAbsOrigin(entity));
    Particles.SetParticleControl(health_fx, 1, [10, value, 0]);
    Particles.SetParticleControl(health_fx, 2, [2, digits, 0]);
    Particles.SetParticleControl(health_fx, 3, [0, 255, 0]);
    Particles.ReleaseParticleIndex(health_fx);
}

function ScreenParticleEvent(event: CustomGameEventDeclarations["CMsg_SendScreenParticle"]) {
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    let screen_type = event.data.screen_type;

    if (screen_type == "GetTreasure") {
        let effect = Particles.CreateParticle(
            "particles/diy_particles/screen_arcane.vpcf",
            ParticleAttachment_t.PATTACH_WORLDORIGIN,
            queryUnit
        );
        Particles.ReleaseParticleIndex(effect);
    }

}
export const DamageFloatingHud = () => {

    // useGameEvent("Function_PopupHealthToClients", PopupHealth, []);
    // useGameEvent("Function_PopupNumbersToClients", DamageFloating, []);
    // useGameEvent("Function_PopupImmunityEffect", ImmunityEffect, []);
    // useGameEvent("CMsg_SendScreenParticle", ScreenParticleEvent, []);
    return <></>;
};