import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI(title="Telegram MiniApp Forms")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/agent-form", response_class=HTMLResponse)
async def agent_form(request: Request):
    return FileResponse("templates/agent-form.html")

@app.get("/sales-point-form", response_class=HTMLResponse)
async def sales_point_form(request: Request):
    return FileResponse("templates/sales-point-form.html")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )