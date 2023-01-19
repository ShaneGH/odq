
REM cd command in cmd prints CWD

echo %cd%

powershell "cd %cd%; cd ../../; ./buildDist.ps1"