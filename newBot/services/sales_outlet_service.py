from .backend_client import BackendClient

class SalesOutletService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def list_outlets(self, partner_id: int) -> list[dict]:
        resp = self.client.get(f"sales-outlet/partner/{partner_id}")
        return resp if isinstance(resp, list) else resp.get("items", [])

    def create_outlet(
        self,
        partner_id: int,
        name: str,
        address: str | None,
        description: str = "",
        *,
        type: str = "SELLER",
        telegram_id: str | None = None,
        link: str | None = None,
    ) -> dict:
        """Create a sales outlet with extended data."""
        payload = {
            "partnerId": partner_id,
            "name": name,
            "address": address,
            "description": description,
            "type": type,
            "telegramId": telegram_id,
            "link": link,
        }
        return self.client.post("sales-outlet", payload)

    def update_outlet(self, outlet_id: int, data: dict) -> None:
        self.client.put(f"sales-outlet/{outlet_id}", data)