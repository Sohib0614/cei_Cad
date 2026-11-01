@echo off
title CEI Estimation LLC - CAD Takeoff System
color 0E

echo ============================================================
echo         CEI ESTIMATION LLC - DESKTOP CAD TAKEOFF
echo                 PRO ESTIMATING SUITE v3.0
echo ============================================================
echo [*] Checking local computer storage...
if not exist "%USERPROFILE%\Documents\CEI_Estimation\Projects" (
    mkdir "%USERPROFILE%\Documents\CEI_Estimation\Projects"
)
if not exist "%USERPROFILE%\Documents\CEI_Estimation\Plans" (
    mkdir "%USERPROFILE%\Documents\CEI_Estimation\Plans"
)

echo [*] Computer Storage Directory: %USERPROFILE%\Documents\CEI_Estimation
echo [*] No Remote Server Connection: 100%% Local & Autonomous
echo [*] No Login Barrier: Direct Workspace Launch
echo.
echo [*] Starting CEI CAD Takeoff Application...
start "" http://localhost:3000
cmd /c npx next start -p 3000
pause

