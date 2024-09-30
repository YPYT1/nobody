import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";


@registerAbility()
export class skywrath_3b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3b"
    }
}
@registerModifier()
export class modifier_skywrath_3b extends BaseHeroModifier {

}