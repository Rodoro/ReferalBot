from .backend_client import BackendClient

class PoetService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def register_poet(
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
        return self.client.post("poet/bot", payload)

    def approve_poet(self, user_id: int) -> bool:
        self.client.put(f"poet/bot/{user_id}", {"approved": True})
        return True

    def sign_poet_contract(self, user_id: int) -> None:
        self.client.put(f"poet/bot/{user_id}", {"contractSigned": True})

    def get_poet_profile(self, user_id: int) -> dict:
        return self.client.get(f"poet/bot/{user_id}")

    def remove_poet(self, user_id: int) -> bool:
        self.client.delete(f"poet/bot/{user_id}")
        return True