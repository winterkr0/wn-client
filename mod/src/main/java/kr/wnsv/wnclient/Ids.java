package kr.wnsv.wnclient;

// 리소스 ID 클래스 이름이 버전마다 달라서 한 곳에 모아 둡니다.
public final class Ids {
    private Ids() {}

    //? if >=1.21.11 {
    /*public static net.minecraft.resources.Identifier of(String path) {
        return net.minecraft.resources.Identifier.fromNamespaceAndPath(WNClient.MOD_ID, path);
    }
    *///?} else if >=1.21 {
    public static net.minecraft.resources.ResourceLocation of(String path) {
        return net.minecraft.resources.ResourceLocation.fromNamespaceAndPath(WNClient.MOD_ID, path);
    }
    //?} else {
    /*public static net.minecraft.resources.ResourceLocation of(String path) {
        return new net.minecraft.resources.ResourceLocation(WNClient.MOD_ID, path);
    }
    *///?}
}
