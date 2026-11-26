package kr.wnsv.wnclient.mixin;

import net.minecraft.client.OptionInstance;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Mutable;
import org.spongepowered.asm.mixin.gen.Accessor;

// 풀브라이트용: 옵션 값 범위 검사를 거치지 않고 값을 넣기 위한 접근자
@Mixin(OptionInstance.class)
public interface OptionInstanceAccessor {
    @Mutable
    @Accessor("value")
    void wn$setValue(Object value);
}
