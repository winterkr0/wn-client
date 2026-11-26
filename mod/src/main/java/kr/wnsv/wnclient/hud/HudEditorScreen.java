package kr.wnsv.wnclient.hud;

import kr.wnsv.wnclient.Config;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.components.events.GuiEventListener;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;
import org.lwjgl.glfw.GLFW;

import java.util.function.BooleanSupplier;
import java.util.function.Consumer;

/**
 * HUD 편집기 (기본 키: 오른쪽 Shift).
 * 마우스 입력 API가 버전마다 바뀌기 때문에 드래그는 GLFW로 직접 읽습니다.
 */
public class HudEditorScreen extends Screen {
    private HudElement dragging;
    private int offX;
    private int offY;
    private boolean wasDown;

    public HudEditorScreen() {
        super(Component.literal("WN Client"));
    }

    @Override
    protected void init() {
        int rows = HudElements.ALL.size() + 4;
        int x = this.width / 2 - 80;
        int y = Math.max(24, this.height / 2 - rows * 12);

        for (HudElement e : HudElements.ALL) {
            toggle(x, y, e.label, () -> e.pos().enabled, v -> e.pos().enabled = v);
            y += 24;
        }
        Config c = Config.get();
        toggle(x, y, "줌 (C)", () -> c.zoom, v -> c.zoom = v);
        y += 24;
        toggle(x, y, "풀브라이트 (G)", () -> c.fullbright, v -> c.fullbright = v);
        y += 24;
        toggle(x, y, "토글 스프린트 (V)", () -> c.toggleSprint, v -> c.toggleSprint = v);
        y += 28;
        addRenderableWidget(Button.builder(Component.literal("완료"), b -> onClose()).bounds(x, y, 160, 20).build());
    }

    private void toggle(int x, int y, String name, BooleanSupplier get, Consumer<Boolean> set) {
        addRenderableWidget(Button.builder(label(name, get.getAsBoolean()), b -> {
            set.accept(!get.getAsBoolean());
            b.setMessage(label(name, get.getAsBoolean()));
            Config.save();
        }).bounds(x, y, 160, 20).build());
    }

    private static Component label(String name, boolean on) {
        return Component.literal(name + ": " + (on ? "§a켜짐" : "§c꺼짐"));
    }

    @Override
    public void render(GuiGraphics g, int mouseX, int mouseY, float delta) {
        super.render(g, mouseX, mouseY, delta);
        Minecraft mc = Minecraft.getInstance();

        boolean down = GLFW.glfwGetMouseButton(GLFW.glfwGetCurrentContext(), GLFW.GLFW_MOUSE_BUTTON_LEFT) == GLFW.GLFW_PRESS;
        if (down && !wasDown && !overWidget(mouseX, mouseY)) {
            for (int i = HudElements.ALL.size() - 1; i >= 0; i--) {
                HudElement e = HudElements.ALL.get(i);
                Config.Pos p = e.pos();
                if (p.enabled && hit(mc, e, mouseX, mouseY)) {
                    dragging = e;
                    offX = mouseX - p.x;
                    offY = mouseY - p.y;
                    break;
                }
            }
        }
        if (!down && dragging != null) {
            dragging = null;
            Config.save();
        }
        if (dragging != null) {
            Config.Pos p = dragging.pos();
            p.x = HudRenderer.clamp(mouseX - offX, this.width - dragging.width(mc));
            p.y = HudRenderer.clamp(mouseY - offY, this.height - dragging.height(mc));
        }
        wasDown = down;

        for (HudElement e : HudElements.ALL) {
            Config.Pos p = e.pos();
            if (!p.enabled) continue;
            int w = e.width(mc);
            int h = e.height(mc);
            int x = HudRenderer.clamp(p.x, this.width - w);
            int y = HudRenderer.clamp(p.y, this.height - h);
            e.draw(g, mc, x, y);
            boolean hot = e == dragging || hit(mc, e, mouseX, mouseY);
            outline(g, x - 1, y - 1, w + 2, h + 2, hot ? HudElements.ACCENT : 0x80FFFFFF);
        }
        g.drawCenteredString(this.font, "§aWN Client §f설정 · 요소를 드래그해서 옮기세요 · ESC로 닫기", this.width / 2, 8, HudElements.WHITE);
    }

    private boolean hit(Minecraft mc, HudElement e, int mx, int my) {
        Config.Pos p = e.pos();
        int x = HudRenderer.clamp(p.x, this.width - e.width(mc));
        int y = HudRenderer.clamp(p.y, this.height - e.height(mc));
        return mx >= x && my >= y && mx < x + e.width(mc) && my < y + e.height(mc);
    }

    private boolean overWidget(double mx, double my) {
        for (GuiEventListener c : this.children()) {
            if (c.isMouseOver(mx, my)) return true;
        }
        return false;
    }

    private static void outline(GuiGraphics g, int x, int y, int w, int h, int color) {
        g.fill(x, y, x + w, y + 1, color);
        g.fill(x, y + h - 1, x + w, y + h, color);
        g.fill(x, y, x + 1, y + h, color);
        g.fill(x + w - 1, y, x + w, y + h, color);
    }

    @Override
    public void onClose() {
        Config.save();
        super.onClose();
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }
}
