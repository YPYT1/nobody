import { useGameEvent } from "react-panorama-x";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { useCallback, useEffect, useRef, useState } from "react";

export const AbilityButtonItem = ({ order, is_main }: { order: number; is_main: boolean }) => {

    const queryUnit = Players.GetLocalPlayerPortraitUnit();
    const refPanel = useRef<Panel | null>();
    const [m_Ability, setMAbility] = useState(Entities.GetAbility(queryUnit, order));
    const hotkey = Abilities.GetKeybind(m_Ability);
    const [isHidden, setIsHidden] = useState(Abilities.IsHidden(m_Ability));
    const [abilityShow, setAbilityShow] = useState(m_Ability != -1 && isHidden == false);
    const [isReady, setIsReady] = useState(true);
    const [screenPos, setScreenPos] = useState<[number, number, number]>([0, 0, 0]);
    const [cdValue, setCdValue] = useState(0);
    const [manaCost, setManaCost] = useState(0);
    const [deg, setDeg] = useState(-360);
    const [barPct, setBarPct] = useState(0);
    const [isPassive, setIsPassive] = useState(false);
    const [Charges, setCharges] = useState(0);

    const UpdateLocalPlayer = useCallback(() => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        const m_Ability = Entities.GetAbility(queryUnit, order);
        setMAbility(m_Ability);
        if (m_Ability != -1) {
            const abilityname = Abilities.GetAbilityName(m_Ability);
            const cooldownLength = Abilities.GetCooldownLength(m_Ability);
            const cooldownRemaining = Abilities.GetCooldownTimeRemaining(m_Ability);
            const isHidden = Abilities.IsHidden(m_Ability);

            const ability_name = Abilities.GetAbilityName(m_Ability);
            const ability_level = Abilities.GetLevel(m_Ability);

            const have_nmana = Entities.GetMana(queryUnit);

            setIsHidden(Abilities.IsHidden(m_Ability));

            setDeg(deg);
            setAbilityShow(m_Ability != -1 && isHidden == false);

            // 充能

            // let cool = Abilities.getrest
            // $.Msg(["abilityname", abilityname, charges, ability_charges]);
            // let is_chargs = Abilities.IsActivatedChanging(m_Ability);
            // let current_charges = Abilities.GetCurrentCharges(m_Ability);
            // $.Msg([is_chargs, current_charges]);
            if (refPanel.current) {
                const is_charges = Abilities.UsesAbilityCharges(m_Ability);
                const need_mana = Abilities.GetManaCost(m_Ability);
                setManaCost(need_mana);


                refPanel.current.SetHasClass("is_active", m_Ability == Abilities.GetLocalPlayerActiveAbility());
                refPanel.current.SetHasClass("is_passive", Abilities.IsPassive(m_Ability));
                refPanel.current.SetHasClass("is_silenced", Entities.IsSilenced(queryUnit));
                refPanel.current.SetHasClass("is_toggle", Abilities.IsToggle(m_Ability));
                refPanel.current.SetHasClass("is_autocast", Abilities.IsAutocast(m_Ability));
                refPanel.current.SetHasClass("auto_state", Abilities.GetAutoCastState(m_Ability));
                refPanel.current.SetHasClass("in_toggle", Abilities.GetToggleState(m_Ability));

                refPanel.current.SetHasClass("no_learn", Abilities.GetLevel(m_Ability) == 0);
                refPanel.current.SetHasClass("ability_charges", is_charges);
                refPanel.current.SetHasClass("insufficient_mana", have_nmana < need_mana);
                refPanel.current.enabled = Abilities.IsActivated(m_Ability);

                const ShinePanel = refPanel.current.FindChildTraverse("Shine")!;
                ShinePanel.SetHasClass("do_shine", Abilities.IsCooldownReady(m_Ability));

                // 冷却
                if (is_charges) {
                    // let Charges = Abilities.GetCurrentAbilityCharges(m_Ability);
                    // setCharges(Charges);
                    // refPanel.current.SetHasClass("in_cooldown", !Abilities.IsCooldownReady(m_Ability) && Charges == 0);
                    // let RestoreCooldown = Abilities.GetAbilityChargeRestoreTimeRemaining(m_Ability);
                    // let rest_time = GetAbilityChargeRestoreTime(ability_name, ability_level);
                    // let cooldown_total = Abilities.GetCooldown(m_Ability) == 0 ? -1 : Abilities.GetCooldown(m_Ability);
                    // setBarPct(100 - RestoreCooldown / rest_time * 100);
                    // setCdValue(parseInt(RestoreCooldown.toFixed(1)));
                    // let deg = Math.ceil(-360 * RestoreCooldown / Math.max(0.1, rest_time));
                    // setDeg(deg);
                } else {
                    refPanel.current.SetHasClass("in_cooldown", !Abilities.IsCooldownReady(m_Ability));
                    let cooldown_total = Abilities.GetCooldown(m_Ability) == 0 ? -1 : Abilities.GetCooldown(m_Ability);
                    let deg = Math.ceil(-360 * cooldownRemaining / cooldown_total);
                    setDeg(deg);
                    setBarPct(100 - cooldownRemaining / cooldown_total * 100);
                    setCdValue(Math.ceil(Abilities.GetCooldownTimeRemaining(m_Ability)));
                }

                // 副职提示
                refPanel.current.SetHasClass("deputy_select", abilityname == "public_deputy_select");
            }
        } else {
            setAbilityShow(false);
        }

    }, []);

    // useEffect(() => {
    //     const interval = setInterval(() => { UpdateLocalPlayer(); }, 100);
    //     return () => clearInterval(interval);
    // }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_portrait_ability_layout_changed", UpdateLocalPlayer, []);
    useGameEvent("dota_ability_changed", UpdateLocalPlayer, []);
    useGameEvent("dota_hero_ability_points_changed", UpdateLocalPlayer, []);

 
    return (
        <Panel
            className={`AbilityButtonItem ${!abilityShow ? " hide" : ""}`}
            ref={e => refPanel.current = e}
        >
            <Button className="AbilityReselect" />
            <Panel className="AbilityContainer">
                <Panel className='AbilityCharges' hittest={false} hittestchildren={false}>
                    {/* <Panel className='AbilityChargesBorder'></Panel> */}
                    <CircularProgressBar id="AbilityChargesBorder" value={barPct} max={100} min={0} />
                    <Label text={Charges} />
                </Panel>
                <Panel className='Hotkey' hittest={false} hittestchildren={false}>
                    <Label dialogVariables={{ hotkey }} localizedText='{s:hotkey}' />
                </Panel>
                <Panel id='CostContainer' hittest={false}>
                    <Label id='ManaCost' hittest={false} text={manaCost} visible={manaCost > 0} />
                </Panel>
                <Panel className='ButtonAndLevel'>
                    <CircularProgressBar id="CooldownProgress" value={barPct} max={100} min={0} />
                    <CircularProgressBar id="CooldownProgressBlur" value={barPct} max={100} min={0} />
                    <Panel id="AutocastableAbilityBorder" />
                    <Panel className='ButtonSize'>
                        <Button
                            className='AbilityButton'
                            onactivate={(e) => {
                                if (GameUI.IsAltDown()) {
                                    Abilities.PingAbility(m_Ability);
                                } else {
                                    Abilities.ExecuteAbility(m_Ability, queryUnit, false);
                                }
                            }}
                            oncontextmenu={(e) => {
                                if (Abilities.IsAutocast(m_Ability)) {
                                    Game.PrepareUnitOrders({
                                        OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO,
                                        AbilityIndex: m_Ability
                                    });
                                }
                            }}
                            onmouseout={(e) => {
                                HideCustomTooltip();
                            }}
                            onmouseover={(e) => {
                                ShowCustomTooltip(e, "ability", "", m_Ability, 1, 1);
                            }}

                        >
                            <DOTAAbilityImage id='AbilityImage' hittest={false} contextEntityIndex={m_Ability} />
                            <Panel id="Cooldown" hittest={false}>
                                <Panel id="CooldownOverlay" style={{ clip: `radial( 50.0% 50.0%, 0.0deg, ${deg}deg)` }} hittest={false} />
                                <Label id="CooldownTimer" text={cdValue} hittest={false} />
                            </Panel>
                            <Panel id='ActiveAbility' />
                            <Panel id="PassiveAbilityBorder" />
                            <Panel id="ActiveAbilityBorder" />

                            <Panel id="SilencedOverlay" />
                            <Panel hittest={false} id="ShineContainer" className=''>
                                <Panel hittest={false} id="Shine" className="do_shine" />
                            </Panel>
                        </Button>

                        <Panel hittest={false} id="ShineContainer" className=''>
                            <Panel hittest={false} id="Shine" className="do_shine" />
                        </Panel>
                    </Panel>
                    <Panel id='AutoCastingContainer' hittest={false}>
                        <DOTAScenePanel
                            id="AutoCasting"
                            map="scenes/hud/autocasting"
                            renderdeferred={false}
                            rendershadows={false}
                            camera="camera_1"
                            hittest={false}
                            particleonly={true}
                        />
                    </Panel>
                </Panel>
            </Panel>
        </Panel>
    );
};

export const AbilityList = () => {

    return (

        <Panel id='AbilityList' >
            <AbilityButtonItem order={0} is_main={true} />
            <AbilityButtonItem order={1} is_main={true} />
            <AbilityButtonItem order={2} is_main={true} />
            <AbilityButtonItem order={3} is_main={true} />
            <AbilityButtonItem order={4} is_main={true} />
            <AbilityButtonItem order={5} is_main={true} />
            {/* <AbilityButtonItem order={6} /> */}
        </Panel>


    );
};