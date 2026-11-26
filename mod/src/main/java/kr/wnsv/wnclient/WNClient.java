package kr.wnsv.wnclient;

import com.mojang.blaze3d.platform.InputConstants;
import kr.wnsv.wnclient.hud.HudRenderer;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientLifecycleEvents;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.KeyMapping;
import org.lwjgl.glfw.GLFW;
//? if >=1.21.6 {
/*import net.fabricmc.fabric.api.client.rendering.v1.hud.HudElementRegistry;
*///?} else {
import net.fabricmc.fabric.api.client.rendering.v1.HudRenderCallback;
//?}

public class WNClient implements ClientModInitializer {
    public static final String MOD_ID = "wnclient";

    //? if >=1.21.9 {
    /*private static final KeyMapping.Category CATEGORY = KeyMapping.Category.register(Ids.of("main"));
    *///?} else {
    private static final String CATEGORY = "key.categories.wnclient";
    //?}

    public static KeyMapping editorKey;
    public static KeyMapping zoomKey;
    public static KeyMapping fullbrightKey;
    public static KeyMapping sprintKey;

    @Override
    public void onInitializeClient() {
        Config.load();

        editorKey = key("key.wnclient.editor", GLFW.GLFW_KEY_RIGHT_SHIFT);
        zoomKey = key("key.wnclient.zoom", GLFW.GLFW_KEY_C);
        fullbrightKey = key("key.wnclient.fullbright", GLFW.GLFW_KEY_G);
        sprintKey = key("key.wnclient.togglesprint", GLFW.GLFW_KEY_V);

        ClientTickEvents.END_CLIENT_TICK.register(Features::tick);
        ClientLifecycleEvents.CLIENT_STOPPING.register(mc -> {
            Features.restoreGamma(mc);
            Config.save();
        });

        //? if >=1.21.6 {
        /*HudElementRegistry.addLast(Ids.of("hud"), (graphics, tick) -> HudRenderer.render(graphics));
        *///?} else {
        HudRenderCallback.EVENT.register((graphics, tick) -> HudRenderer.render(graphics));
        //?}
    }

    private static KeyMapping key(String name, int code) {
        return KeyBindingHelper.registerKeyBinding(new KeyMapping(name, InputConstants.Type.KEYSYM, code, CATEGORY));
    }
}
