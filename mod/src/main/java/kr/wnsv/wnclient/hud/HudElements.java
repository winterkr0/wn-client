package kr.wnsv.wnclient.hud;

import kr.wnsv.wnclient.Cps;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.multiplayer.PlayerInfo;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.item.ItemStack;

import java.util.List;
import java.util.function.Function;

public final class HudElements {
    public static final int BG = 0x70000000;
    public static final int WHITE = 0xFFFFFFFF;
    public static final int ACCENT = 0xFF4A78E8; // 코발트
    public static final int GOOD = 0xFF4ADE80;

    private HudElements() {}

    /** 한 줄짜리 텍스트 박스 */
    static final class Text extends HudElement {
        private final Function<Minecraft, String> text;

        Text(String id, String label, int x, int y, Function<Minecraft, String> text) {
            super(id, label, x, y);
            this.text = text;
        }

        private String value(Minecraft mc) {
            return mc.player == null ? label : text.apply(mc);
        }

        @Override public int width(Minecraft mc) { return mc.font.width(value(mc)) + 8; }
        @Override public int height(Minecraft mc) { return 16; }

        @Override
        public void draw(GuiGraphics g, Minecraft mc, int x, int y) {
            g.fill(x, y, x + width(mc), y + 16, BG);
            g.drawString(mc.font, value(mc), x + 4, y + 4, WHITE, false);
        }
    }

    static final HudElement FPS = new Text("fps", "FPS", 4, 4, mc -> "FPS: " + mc.getFps());

    static final HudElement CPS = new Text("cps", "CPS", 4, 22,
            mc -> "CPS: " + Cps.get(true) + " | " + Cps.get(false));

    static final HudElement PING = new Text("ping", "Ping", 4, 40, mc -> {
        if (mc.getConnection() == null || mc.player == null) return "Ping: -";
        PlayerInfo info = mc.getConnection().getPlayerInfo(mc.player.getUUID());
        return "Ping: " + (info == null ? "-" : info.getLatency() + "ms");
    });

    static final HudElement COORDS = new Text("coords", "XYZ", 4, 58, mc -> String.format(
            "XYZ: %d, %d, %d  %s",
            mc.player.getBlockX(), mc.player.getBlockY(), mc.player.getBlockZ(),
            mc.player.getDirection().getName().toUpperCase()));

    /** WASD + 마우스 + 스페이스 */
    static final HudElement KEYSTROKES = new HudElement("keystrokes", "Keystrokes", 4, 80) {
        private static final int S = 22;
        private static final int GAP = 2;
        private static final int W = S * 3 + GAP * 2;

        @Override public int width(Minecraft mc) { return W; }
        @Override public int height(Minecraft mc) { return S * 3 + 12 + GAP * 3; }

        private void key(GuiGraphics g, Font font, KeyMapping km, String label, int x, int y, int w, int h) {
            boolean down = km.isDown();
            g.fill(x, y, x + w, y + h, down ? 0xD0FFFFFF : BG);
            int color = down ? 0xFF000000 : WHITE;
            g.drawString(font, label, x + (w - font.width(label)) / 2, y + (h - 8) / 2, color, false);
        }

        @Override
        public void draw(GuiGraphics g, Minecraft mc, int x, int y) {
            var o = mc.options;
            Font f = mc.font;
            key(g, f, o.keyUp, "W", x + S + GAP, y, S, S);
            int r2 = y + S + GAP;
            key(g, f, o.keyLeft, "A", x, r2, S, S);
            key(g, f, o.keyDown, "S", x + S + GAP, r2, S, S);
            key(g, f, o.keyRight, "D", x + (S + GAP) * 2, r2, S, S);
            int r3 = r2 + S + GAP;
            int half = (W - GAP) / 2;
            key(g, f, o.keyAttack, Cps.get(true) + " CPS", x, r3, half, S);
            key(g, f, o.keyUse, Cps.get(false) + " CPS", x + half + GAP, r3, W - half - GAP, S);
            int r4 = r3 + S + GAP;
            boolean jump = o.keyJump.isDown();
            g.fill(x, r4, x + W, r4 + 12, jump ? 0xD0FFFFFF : BG);
            g.fill(x + W / 2 - 12, r4 + 5, x + W / 2 + 12, r4 + 7, jump ? 0xFF000000 : WHITE);
        }
    };

    /** 갑옷 + 손에 든 아이템 내구도 */
    static final HudElement ARMOR = new HudElement("armor", "Armor", 4, 170) {
        private final EquipmentSlot[] slots = {
                EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET, EquipmentSlot.MAINHAND
        };

        @Override public int width(Minecraft mc) { return 60; }
        @Override public int height(Minecraft mc) { return slots.length * 17; }

        @Override
        public void draw(GuiGraphics g, Minecraft mc, int x, int y) {
            if (mc.player == null) {
                g.fill(x, y, x + 60, y + height(mc), BG);
                g.drawString(mc.font, label, x + 4, y + 4, WHITE, false);
                return;
            }
            int row = y;
            for (EquipmentSlot slot : slots) {
                ItemStack st = mc.player.getItemBySlot(slot);
                if (!st.isEmpty()) {
                    g.renderItem(st, x, row);
                    g.renderItemDecorations(mc.font, st, x, row);
                    if (st.isDamageableItem()) {
                        int left = st.getMaxDamage() - st.getDamageValue();
                        float ratio = left / (float) st.getMaxDamage();
                        int color = ratio > 0.5f ? GOOD : ratio > 0.2f ? 0xFFFACC15 : 0xFFF87171;
                        g.drawString(mc.font, String.valueOf(left), x + 19, row + 4, color, true);
                    } else if (st.getCount() > 1) {
                        g.drawString(mc.font, String.valueOf(st.getCount()), x + 19, row + 4, WHITE, true);
                    }
                }
                row += 17;
            }
        }
    };

    public static final List<HudElement> ALL = List.of(FPS, CPS, PING, COORDS, KEYSTROKES, ARMOR);
}
