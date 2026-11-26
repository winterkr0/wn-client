# WN Client

페더 클라이언트처럼 **런처 + 인게임 모드**로 된 마인크래프트 클라이언트입니다.
지원 버전: 1.20.1 · 1.20.4 · 1.20.6 · 1.21.1 · 1.21.4 · 1.21.5 · 1.21.8 · 1.21.10 · 1.21.11

```
wn-client/
├─ launcher/   Electron 런처 (MS 로그인, 버전 선택, Java·Fabric·모드 자동 설치, 서버 바로 접속)
└─ mod/        Fabric 모드 (HUD 편집기, FPS/CPS/핑/좌표/키스트로크/갑옷, 줌, 풀브라이트, 토글 스프린트)
```

## 더블클릭으로 실행되는 앱 만들기 (제일 쉬운 방법)

### 방법 A — 내 PC에서 (윈도우)
1. [Node.js LTS](https://nodejs.org)와 [JDK 21 (Temurin)](https://adoptium.net)를 설치
2. `build-windows.bat` 더블클릭
3. 끝나면 `launcher\dist` 폴더가 열립니다
   - `WN-Client-Setup-1.0.0.exe` → 설치형. 바탕화면에 **WN Client** 아이콘이 생기고, 그다음부턴 아이콘 더블클릭
   - `WN-Client-Portable-1.0.0.exe` → 설치 없이 이 파일만 더블클릭

맥/리눅스는 `./build.sh`.

### 방법 B — GitHub에 올리기만 하면 자동 빌드 (PC에 아무것도 안 깔아도 됨)
1. 이 폴더를 GitHub 저장소에 푸시
2. **Actions** 탭 → 실행이 끝나면 **Artifacts**에서 윈도우/맥/리눅스 파일 다운로드
3. 플레이어들에게 배포할 땐 `git tag v1.0.0 && git push --tags` → **Releases**에 .exe가 자동으로 올라감

> 코드 서명 인증서가 없어서 처음 실행할 때 윈도우가 "PC 보호" 경고를 띄울 수 있어요.
> **추가 정보 → 실행**을 누르면 열립니다. 경고를 없애려면 코드 서명 인증서(유료)가 필요해요.

## 준비물 (직접 개발할 때)
- Node.js 20 이상
- JDK 21 (모드 빌드용. 게임용 Java는 런처가 알아서 받습니다)
- Gradle 8.14 이상 또는 IntelliJ IDEA

## 1. 인게임 모드 빌드
```bash
cd mod
./gradlew build         # 윈도우는 gradlew.bat build
```
- 버전 9개가 한 번에 빌드되고 `launcher/mods/wnclient-<버전>.jar`로 자동 복사됩니다.
- **빌드가 Fabric API 버전 때문에 실패하면** `mod/versions/<버전>/gradle.properties`의
  `deps.fabric_api` 값을 https://fabricmc.net/develop/ 에 나오는 번호로 바꿔 주세요.
- 하나의 소스로 여러 버전을 지원하려고 [Stonecutter](https://stonecutter.kikugie.dev/)를 씁니다.
  코드 안의 `//? if >=1.21.6 {` 같은 주석이 버전별 분기입니다. IntelliJ에서는 Stonecutter 플러그인을 깔면 편합니다.
- 한 버전만 테스트 실행: `./gradlew :1.21.1:runClient`

## 2. 런처 실행 / 배포
```bash
cd launcher
npm install
npm start               # 개발 모드 실행
npm run dist            # 설치 파일 만들기 (dist/ 폴더, 윈도우는 .exe)
```

## 런처가 하는 일
1. Microsoft 계정 로그인 (msmc 라이브러리, 토큰은 OS 암호화로 저장)
2. 선택한 버전에 맞는 Java(17 또는 21)를 모장 공식 런타임에서 받아옴
3. Fabric 로더 설치
4. Modrinth에서 Fabric API, Sodium, Lithium, FerriteCore, Entity Culling, ImmediatelyFast를 버전에 맞게 받아옴
5. `launcher/mods`에 있는 WN Client 모드를 넣음
6. 실행. "바로 접속"이 켜져 있으면 서버(기본값 wnsv.kr)로 곧장 들어감

버전마다 따로 인스턴스 폴더를 써서 모드가 섞이지 않습니다. 위치: `%APPDATA%/.wnclient/instances/<버전>`

## 인게임 단축키 (조작 설정에서 변경 가능)
| 키 | 기능 |
|---|---|
| 오른쪽 Shift | HUD 편집기 (드래그로 위치 이동, 요소 켜기/끄기) |
| C (누르고 있기) | 줌 |
| G | 풀브라이트 |
| V | 토글 스프린트 |

## 바꾸기 쉬운 곳
- 이름, 서버 주소, 버전 목록: `launcher/src/config.js`
- 자동으로 받는 최적화 모드 목록: `launcher/src/install.js`의 `MODRINTH_MODS`
- 런처 디자인: `launcher/renderer/style.css`
- HUD 요소 추가: `mod/src/main/java/kr/wnsv/wnclient/hud/HudElements.java`

## 참고
- 마인크래프트 게임 파일은 런처가 모장 서버에서 직접 받으므로, 배포물에 넣지 않아도 됩니다.
- 풀브라이트는 일부 서버에서 금지일 수 있습니다. 자기 서버 규칙에 맞게 쓰세요.
