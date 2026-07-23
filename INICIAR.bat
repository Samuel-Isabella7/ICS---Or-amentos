@echo off
title ICS Orcamentos - Servidor
cd /d "%~dp0"
echo.
echo  Iniciando o ICS Orcamentos...
echo  O navegador vai abrir sozinho em alguns segundos.
echo  Para desligar o sistema, feche esta janela.
echo.
start /b cmd /c "timeout /t 8 >nul & start http://localhost:3344"
npm start
