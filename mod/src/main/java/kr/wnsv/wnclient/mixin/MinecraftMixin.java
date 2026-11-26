package kr.wnsv.wnclient.mixin;

import kr.wnsv.wnclient.Cps;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// 좌클릭/우클릭이 게임에 들어갈 때마다 CPS를 셉니다.
@Mixin(Minecraft.class)
public abstract class MinecraftMixin {
    @Inject(method = "startAttack", at = @At("HEAD"), require = 0)
    private void wn$onAttack(CallbackInfoReturnable<Boolean> cir) {
        Cps.click(true);
    }

    @Inject(method = "startUseItem", at = @At("HEAD"), require = 0)
    private void wn$onUse(CallbackInfo ci) {
        Cps.click(false);
    }
}
