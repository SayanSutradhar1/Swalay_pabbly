@echo off
echo Starting Backend Server...
cd /d "%~dp0"
if exist venv\Scripts\activate (
    call venv\Scripts\activate
) else (
    echo Virtual environment not found. Please run 'python -m venv venv' and 'pip install -r requirements.txt' first.
    pause
    exit /b
)

python -m uvicorn main:app --reload --port 8000
pause
