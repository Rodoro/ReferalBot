from .backend_client import BackendClient


class VideoEditorService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def register_video_editor(
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
        return self.client.post("video-editor/bot", payload)

    def approve_video_editor(self, user_id: int) -> bool:
        self.client.put(f"video-editor/bot/{user_id}", {"approved": True})
        return True

    def sign_video_editor_contract(self, user_id: int) -> None:
        self.client.put(f"video-editor/bot/{user_id}", {"contractSigned": True})

    def get_video_editor_profile(self, user_id: int) -> dict:
        return self.client.get(f"video-editor/bot/{user_id}")

    def remove_video_editor(self, user_id: int) -> bool:
        self.client.delete(f"video-editor/bot/{user_id}")
        return True