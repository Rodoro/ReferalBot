from .backend_client import BackendClient

class BannerService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def list_banners(self) -> list[dict]:
        """Return list of banners from backend"""
        result = self.client.get("banners")
        if isinstance(result, list):
            return result
        return result.get("items", [])