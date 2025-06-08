from sqlalchemy.orm import Session
from ..repositories.video_editor_repository import VideoEditorRepository
from ..models.video_editor import VideoEditor

class VideoEditorService:
    def __init__(self, db: Session):
        self.repo = VideoEditorRepository(db)

    def register_video_editor(self, user_id: int, full_name: str, city: str,
                              inn: str, phone: str, business_type: str,
                              bik: str, account: str, bank_name: str,
                              bank_ks: str, bank_details: str) -> VideoEditor:
        return self.repo.create(
            user_id=user_id,
            full_name=full_name,
            city=city,
            inn=inn,
            phone=phone,
            business_type=business_type,
            bik=bik,
            account=account,
            bank_name=bank_name,
            bank_ks=bank_ks,
            bank_details=bank_details,
        )

    def approve_video_editor(self, user_id: int) -> bool:
        return self.repo.approve(user_id)

    def sign_video_editor_contract(self, user_id: int) -> None:
        ok = self.repo.sign_contract(user_id)
        if not ok:
            raise ValueError("Video editor not found or not approved")

    def get_video_editor_profile(self, user_id: int) -> dict:
        obj = self.repo.get_by_user_id(user_id)
        if not obj:
            return {}
        return {
            "full_name": obj.full_name,
            "city": obj.city,
            "inn": obj.inn,
            "phone": obj.phone,
            "business_type": obj.business_type,
            "bank_details": obj.bank_details,
        }
