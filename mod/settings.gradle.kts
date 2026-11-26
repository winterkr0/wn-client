pluginManagement {
    repositories {
        gradlePluginPortal()
        maven("https://maven.fabricmc.net/")
        maven("https://maven.kikugie.dev/releases")
    }
}

plugins {
    id("dev.kikugie.stonecutter") version "0.7.10"
}

// 하나의 소스 코드로 여러 마인크래프트 버전용 jar를 만듭니다.
stonecutter {
    create(rootProject) {
        versions(
            "1.20.1", "1.20.4", "1.20.6",
            "1.21.1", "1.21.4", "1.21.5",
            "1.21.8", "1.21.10", "1.21.11",
        )
        vcsVersion = "1.21.1"
    }
}

rootProject.name = "wnclient"
