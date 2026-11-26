package kr.wnsv.wnclient.hud;

import kr.wnsv.wnclient.Config;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;

public abstract class HudElement {
    public final String id;
    public final String label;
    private final int defX;
    private final int defY;

    protected HudElement(String id, String label, int defX, int defY) {
        this.id = id;
        this.label = label;
        this.defX = defX;
        this.defY = defY;
    }

    public Config.Pos pos() {
        return Config.get().pos(id, defX, defY);
    }

    public abstract int width(Minecraft mc);

    public abstract int height(Minecraft mc);

    public abstract void draw(GuiGraphics g, Minecraft mc, int x, int y);
}
