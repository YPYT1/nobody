import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";


@registerAbility()
export class skywrath_2b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2b"
    }
}
@registerModifier()
export class modifier_skywrath_2b extends BaseHeroModifier {

}