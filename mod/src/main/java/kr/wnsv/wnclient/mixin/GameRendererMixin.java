package kr.wnsv.wnclient.mixin;

import kr.wnsv.wnclient.Config;
import kr.wnsv.wnclient.Features;
import net.minecraft.client.Camera;
import net.minecraft.client.renderer.GameRenderer;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// 줌: 줌 키를 누르는 동안 시야각(FOV)을 줄입니다.
@Mixin(GameRenderer.class)
public abstract class GameRendererMixin {
    //? if >=1.21.2 {
    /*@Inject(method = "getFov", at = @At("RETURN"), cancellable = true)
    private void wn$zoom(Camera camera, float partialTick, boolean useFovSetting, CallbackInfoReturnable<Float> cir) {
        if (Features.isZooming()) cir.setReturnValue((float) (cir.getReturnValue() / Config.get().zoomFactor));
    }
    *///?} else {
    @Inject(method = "getFov", at = @At("RETURN"), cancellable = true)
    private void wn$zoom(Camera camera, float partialTick, boolean useFovSetting, CallbackInfoReturnable<Double> cir) {
        if (Features.isZooming()) cir.setReturnValue(cir.getReturnValue() / Config.get().zoomFactor);
    }
    //?}
}
