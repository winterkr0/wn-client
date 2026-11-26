package kr.wnsv.wnclient;

import java.util.ArrayDeque;

public final class Cps {
    private static final ArrayDeque<Long> LEFT = new ArrayDeque<>();
    private static final ArrayDeque<Long> RIGHT = new ArrayDeque<>();

    private Cps() {}

    public static void click(boolean left) {
        (left ? LEFT : RIGHT).addLast(System.currentTimeMillis());
    }

    public static int get(boolean left) {
        ArrayDeque<Long> q = left ? LEFT : RIGHT;
        long cutoff = System.currentTimeMillis() - 1000L;
        while (!q.isEmpty() && q.peekFirst() < cutoff) q.pollFirst();
        return q.size();
    }
}
