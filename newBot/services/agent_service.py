from newBot.config import settings
from .backend_client import BackendClient
from .banner_service import BannerService
from newBot.lib.image_processor import CSVImageProcessor, generate_banner_image
from typing import List
import random
import string
from .sales_point_service import SalesPointService

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

    def sign_agent_contract(
        self, user_id: int
    ) -> tuple[list[str], str, str, str, str]:
        """Sign agent contract and return sales point and agent referral assets."""
        points = self.list_agent_points(user_id)

        # If consultant has at least one sales point, also sign its contract
        if points:
            sp_user_id = points[0].get("userId") or points[0].get("user_id")
            if sp_user_id:
                sp_service = SalesPointService()
                sp_paths, sp_qr_output, sp_referral_link = sp_service.sign_sales_point_contract(
                    sp_user_id
                )
                code = sp_referral_link.split("ref_")[-1]
                self.client.put(
                    f"agent/bot/{user_id}", {"contractSigned": True, "referralCode": code}
                )

                agent_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"
                qr_processor = CSVImageProcessor(settings.CSV_URL)
                agent_qr = f"agent_qr_{user_id}_plain.png"
                qr_image = qr_processor.generate_qr_code(agent_link, settings.QR_DEFAULT_SIZE)
                qr_image.save(agent_qr)

                return sp_paths, sp_qr_output, sp_referral_link, agent_qr, agent_link

        # Fallback: generate referral link based on consultant profile
        code = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.client.put(
            f"agent/bot/{user_id}", {"contractSigned": True, "referralCode": code}
        )

        referral_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"

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