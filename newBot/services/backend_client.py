import requests
from ..config import settings


class BackendClient:
    def __init__(self) -> None:
        # self.base_url = settings.BACKEND_URL.rstrip("/")
        self.base_url = 'http://localhost:4000'
        self.headers = {"x-bot-token": settings.BOT_SERVICE_TOKEN}

    def post(self, endpoint: str, data: dict) -> dict:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = requests.post(url, json=data, headers=self.headers, timeout=5)
        response.raise_for_status()
        return response.json()

    def get(self, endpoint: str) -> dict:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = requests.get(url, headers=self.headers, timeout=5)
        response.raise_for_status()
        return response.json()

    def put(self, endpoint: str, data: dict) -> dict:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = requests.put(url, json=data, headers=self.headers, timeout=5)
        response.raise_for_status()
        return response.json()

    def delete(self, endpoint: str) -> dict:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = requests.delete(url, headers=self.headers, timeout=5)
        response.raise_for_status()
        return response.json()