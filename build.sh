#!/usr/bin/env bash
# macOS / Linux용 빌드 스크립트: 모드 + 런처 → 앱 파일
set -e
cd "$(dirname "$0")"

echo "[1/3] 인게임 모드 빌드"
(cd mod && chmod +x gradlew && ./gradlew build --no-daemon)

echo "[2/3] 런처 라이브러리 설치"
(cd launcher && npm install)

echo "[3/3] 앱 만들기"
if [[ "$OSTYPE" == darwin* ]]; then
  (cd launcher && npx electron-builder --mac)
else
  (cd launcher && npx electron-builder --linux)
fi

echo "완료! launcher/dist 폴더를 확인하세요."
