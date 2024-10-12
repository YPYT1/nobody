if (IsServer()) {

    function _CreateLinearProjectile(options: CreateLinearProjectileOptions) {
        if (options.fExpireTime == null) {
            options.fExpireTime = GameRules.GetDOTATime(false, false) + 6
        }
        return ProjectileManager.CreateLinearProjectile(options)
    }

}
