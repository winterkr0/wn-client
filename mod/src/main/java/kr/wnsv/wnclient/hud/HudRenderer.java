package kr.wnsv.wnclient.hud;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;

public final class HudRenderer {
    private HudRenderer() {}

    public static void render(GuiGraphics g) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.options.hideGui) return;
        if (mc.screen instanceof HudEditorScreen) return; // 편집기가 직접 그림
        for (HudElement e : HudElements.ALL) {
            var p = e.pos();
            if (!p.enabled) continue;
            int x = clamp(p.x, g.guiWidth() - e.width(mc));
            int y = clamp(p.y, g.guiHeight() - e.height(mc));
            e.draw(g, mc, x, y);
        }
    }

    static int clamp(int v, int max) {
        return Math.max(0, Math.min(v, Math.max(0, max)));
    }
}
