from newBot.config import settings
from .backend_client import BackendClient


class AgentService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def register_agent(
        self,
        user_id: int,
        full_name: str,
        city: str,
        inn: str,
        phone: str,
        business_type: str,
        bik: str,
        account: str,
        bank_name: str,
        bank_ks: str,
        bank_details: str,
    ) -> dict:
        payload = {
            "userId": user_id,
            "fullName": full_name,
            "city": city,
            "inn": inn,
            "phone": phone,
            "businessType": business_type,
            "bik": bik,
            "account": account,
            "bankName": bank_name,
            "bankKs": bank_ks,
            "bankDetails": bank_details,
        }
        return self.client.post("agent/bot", payload)

    def approve_agent(self, user_id: int) -> bool:
        self.client.put(f"agent/bot/{user_id}", {"approved": True})
        return True

    def sign_agent_contract(self, user_id: int) -> str:
        import random
        import string

        code = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.client.put(
            f"agent/bot/{user_id}", {"contractSigned": True, "referralCode": code}
        )
        return f"https://t.me/{settings.BOT_USERNAME}?start=ref_{code}"

    def get_agent_profile(self, user_id: int) -> dict:
        return self.client.get(f"agent/bot/{user_id}")

    def list_agent_points(self, user_id: int) -> list[dict]:
        resp = self.client.get(f"agent/bot/{user_id}/points")
        return resp if isinstance(resp, list) else resp.get("items", [])

    def remove_agent(self, user_id: int) -> bool:
        self.client.delete(f"agent/bot/{user_id}")
        return True
    
    def get_agent_by_code(self, code: str) -> dict:
        return self.client.get(f"agent/ref/{code}")