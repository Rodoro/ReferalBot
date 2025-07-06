from newBot.config import settings
from .backend_client import BackendClient
from .banner_service import BannerService
from newBot.lib.image_processor import CSVImageProcessor, generate_banner_image
from typing import List
import random
import string

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

    def sign_agent_contract(self, user_id: int) -> tuple[list[str], str, str]:
        code = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.client.put(
            f"agent/bot/{user_id}", {"contractSigned": True, "referralCode": code}
        )

        points = self.list_agent_points(user_id)
        if points:
            partner_id = points[0].get("id")
            from .sales_outlet_service import SalesOutletService
            outlet_svc = SalesOutletService()
            outlets = outlet_svc.list_outlets(partner_id)
            if outlets:
                outlet_svc.update_outlet(outlets[0].get("id"), {"referralCode": code})

        referral_link = f"https://t.me/{settings.BOT_USERNAME}?start=ref_{code}"

        banner_service = BannerService()
        banners = banner_service.list_banners()

        paths: List[str] = []
        if banners:
            selected = random.sample(banners, min(2, len(banners)))
            for idx, banner in enumerate(selected):
                image_url = banner.get("imageUrl") or banner.get("image_url")
                left = banner.get("qrLeftOffset") or banner.get("qr_left_offset") or 0
                top = banner.get("qrTopOffset") or banner.get("qr_top_offset") or 0
                size = (
                    banner.get("qrSize")
                    or banner.get("qr_size")
                    or settings.QR_DEFAULT_SIZE
                )
                output_path = f"agent_qr_{user_id}_{idx}.png"
                generate_banner_image(image_url, left, top, size, referral_link, output_path)
                paths.append(output_path)
        else:
            processor = CSVImageProcessor(settings.CSV_URL)
            output_path = f"agent_qr_{user_id}.png"
            processor.process_and_save_image(referral_link, output_path)
            paths.append(output_path)

        qr_processor = CSVImageProcessor(settings.CSV_URL)
        qr_output = f"agent_qr_{user_id}_plain.png"
        qr_image = qr_processor.generate_qr_code(referral_link, settings.QR_DEFAULT_SIZE)
        qr_image.save(qr_output)

        return paths, qr_output, referral_link

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