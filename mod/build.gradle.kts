plugins {
    id("fabric-loom")
}

val mc = stonecutter.current.version
val mcDep = property("mod.mc_dep").toString()
version = "${property("mod.version")}+$mc"
group = "kr.wnsv"

base { archivesName.set("wnclient") }

repositories {
    maven("https://maven.fabricmc.net/")
}

dependencies {
    minecraft("com.mojang:minecraft:$mc")
    mappings(loom.officialMojangMappings())
    modImplementation("net.fabricmc:fabric-loader:${property("deps.fabric_loader")}")
    modImplementation("net.fabricmc.fabric-api:fabric-api:${property("deps.fabric_api")}")
    // Fabric API를 WN Client jar 안에 내장 → mods 폴더에 따로 넣을 필요 없음
    include("net.fabricmc.fabric-api:fabric-api:${property("deps.fabric_api")}")
}

// 1.20.5부터는 Java 21, 그 전은 Java 17
val javaVer = if (stonecutter.eval(mc, ">=1.20.5")) 21 else 17
java {
    sourceCompatibility = JavaVersion.toVersion(javaVer)
    targetCompatibility = JavaVersion.toVersion(javaVer)
}
tasks.withType<JavaCompile>().configureEach {
    options.release.set(javaVer)
    options.encoding = "UTF-8"
}

tasks.processResources {
    val props = mapOf(
        "version" to project.version.toString(),
        "mc_dep" to mcDep,
    )
    inputs.properties(props)
    filesMatching("fabric.mod.json") { expand(props) }
}

tasks.remapJar {
    archiveFileName.set("wnclient-$mc.jar")
}

// 빌드가 끝나면 런처의 mods 폴더로 자동 복사 → 런처가 버전에 맞는 jar를 설치
val copyToLauncher by tasks.registering(Copy::class) {
    from(tasks.remapJar)
    into(rootProject.file("../launcher/mods"))
}
tasks.build { finalizedBy(copyToLauncher) }
