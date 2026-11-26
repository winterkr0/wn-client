package kr.wnsv.wnclient;

import kr.wnsv.wnclient.hud.HudEditorScreen;
import kr.wnsv.wnclient.mixin.OptionInstanceAccessor;
import net.minecraft.client.Minecraft;
import net.minecraft.client.OptionInstance;
import net.minecraft.client.player.LocalPlayer;

public final class Features {
    private static final double FULLBRIGHT_GAMMA = 15.0;

    private static Double savedGamma = null;
    private static boolean sprintHeldByUs = false;
    private static boolean zooming = false;
    private static boolean savedSmoothCamera = false;

    private Features() {}

    public static boolean isZooming() {
        return zooming;
    }

    public static void tick(Minecraft mc) {
        Config cfg = Config.get();
        while (WNClient.editorKey.consumeClick()) {
            if (mc.screen == null) mc.setScreen(new HudEditorScreen());
        }
        while (WNClient.fullbrightKey.consumeClick()) {
            cfg.fullbright = !cfg.fullbright;
            Config.save();
        }
        while (WNClient.sprintKey.consumeClick()) {
            cfg.toggleSprint = !cfg.toggleSprint;
            Config.save();
        }
        applyGamma(mc);
        applySprint(mc);
        applyZoom(mc);
    }

    // 감마 값 검증(0~1)을 우회해서 직접 넣습니다. 끄면 원래 값으로 되돌립니다.
    private static void applyGamma(Minecraft mc) {
        OptionInstance<Double> gamma = mc.options.gamma();
        if (Config.get().fullbright) {
            if (savedGamma == null) savedGamma = Math.min(1.0, gamma.get());
            if (gamma.get() < FULLBRIGHT_GAMMA) {
                ((OptionInstanceAccessor) (Object) gamma).wn$setValue(FULLBRIGHT_GAMMA);
            }
        } else if (savedGamma != null) {
            restoreGamma(mc);
        }
    }

    public static void restoreGamma(Minecraft mc) {
        if (savedGamma != null) {
            mc.options.gamma().set(savedGamma);
            savedGamma = null;
        }
    }

    // 앞으로 걸을 때 달리기 키를 대신 눌러 줍니다 (일반 토글 스프린트와 같은 동작).
    private static void applySprint(Minecraft mc) {
        LocalPlayer p = mc.player;
        boolean want = p != null && Config.get().toggleSprint && mc.screen == null
                && mc.options.keyUp.isDown() && !p.isShiftKeyDown();
        if (want) {
            mc.options.keySprint.setDown(true);
            sprintHeldByUs = true;
        } else if (sprintHeldByUs) {
            mc.options.keySprint.setDown(false);
            sprintHeldByUs = false;
        }
    }

    private static void applyZoom(Minecraft mc) {
        boolean z = Config.get().zoom && mc.screen == null && WNClient.zoomKey.isDown();
        if (z && !zooming) {
            savedSmoothCamera = mc.options.smoothCamera;
            mc.options.smoothCamera = true;
        } else if (!z && zooming) {
            mc.options.smoothCamera = savedSmoothCamera;
        }
        zooming = z;
    }
}
