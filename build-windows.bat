@echo off
chcp 65001 >nul
title WN Client 빌드
cd /d "%~dp0"

echo ============================================
echo   WN Client 빌드 (모드 + 런처 → .exe)
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [오류] Node.js가 없어요. https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요.
  pause & exit /b 1
)
where java >nul 2>nul
if errorlevel 1 (
  echo [오류] JDK 21이 없어요. https://adoptium.net 에서 Temurin 21을 설치한 뒤 다시 실행하세요.
  pause & exit /b 1
)

echo [1/3] 인게임 모드 빌드 중... (처음엔 10분 이상 걸릴 수 있어요)
pushd mod
call gradlew.bat build --no-daemon
if errorlevel 1 (
  popd
  echo [오류] 모드 빌드 실패. 위 로그를 확인하세요.
  pause & exit /b 1
)
popd

echo.
echo [2/3] 런처 라이브러리 설치 중...
pushd launcher
call npm install
if errorlevel 1 (
  popd
  echo [오류] npm install 실패
  pause & exit /b 1
)

echo.
echo [3/3] 실행 파일 만드는 중...
call npx electron-builder --win
if errorlevel 1 (
  popd
  echo [오류] 실행 파일 만들기 실패
  pause & exit /b 1
)
popd

echo.
echo ============================================
echo   완료!  launcher\dist 폴더를 확인하세요.
echo   - WN-Client-Setup-*.exe     : 설치형 (바탕화면 아이콘 생성)
echo   - WN-Client-Portable-*.exe  : 설치 없이 더블클릭 실행
echo ============================================
explorer "launcher\dist"
pause
