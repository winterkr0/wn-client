package kr.wnsv.wnclient;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

public final class Config {
    public static final class Pos {
        public boolean enabled = true;
        public int x;
        public int y;

        public Pos() {}

        Pos(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    public Map<String, Pos> hud = new LinkedHashMap<>();
    public boolean zoom = true;
    public double zoomFactor = 4.0;
    public boolean fullbright = false;
    public boolean toggleSprint = false;

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static Config instance = new Config();

    public static Config get() {
        return instance;
    }

    public Pos pos(String id, int defX, int defY) {
        return hud.computeIfAbsent(id, k -> new Pos(defX, defY));
    }

    private static Path file() {
        return FabricLoader.getInstance().getConfigDir().resolve("wnclient.json");
    }

    public static void load() {
        Path f = file();
        if (!Files.exists(f)) return;
        try (Reader r = Files.newBufferedReader(f, StandardCharsets.UTF_8)) {
            Config c = GSON.fromJson(r, Config.class);
            if (c != null) {
                if (c.hud == null) c.hud = new LinkedHashMap<>();
                instance = c;
            }
        } catch (Exception e) {
            System.err.println("[Cobalt Client] 설정을 읽지 못해 기본값을 씁니다: " + e);
        }
    }

    public static void save() {
        try {
            Files.createDirectories(file().getParent());
            try (Writer w = Files.newBufferedWriter(file(), StandardCharsets.UTF_8)) {
                GSON.toJson(instance, w);
            }
        } catch (IOException e) {
            System.err.println("[Cobalt Client] 설정 저장 실패: " + e);
        }
    }
}
