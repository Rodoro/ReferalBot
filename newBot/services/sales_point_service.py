from newBot.config import settings
from .backend_client import BackendClient
from .banner_service import BannerService
from newBot.lib.image_processor import CSVImageProcessor, generate_banner_image
import random
import string


class SalesPointService:
    def __init__(self) -> None:
        self.client = BackendClient()

    def register_sales_point(
        self,
        user_id: int,
        agent_id: int,
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
            "agentId": agent_id,
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
        return self.client.post("sales-point/bot", payload)

    def approve_sales_point(self, user_id: int) -> bool:
        self.client.put(f"sales-point/bot/{user_id}", {"approved": True})
        return True

    def sign_sales_point_contract(self, user_id: int) -> tuple[list[str], str]:
        code = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.client.put(
            f"sales-point/bot/{user_id}",
            {"contractSigned": True, "referralCode": code},
        )

        referral_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"

        banner_service = BannerService()
        banners = banner_service.list_banners()

        paths: list[str] = []
        if banners:
            for idx, banner in enumerate(banners):
                image_url = banner.get("imageUrl") or banner.get("image_url")
                left = banner.get("qrLeftOffset") or banner.get("qr_left_offset") or 0
                top = banner.get("qrTopOffset") or banner.get("qr_top_offset") or 0
                size = banner.get("qrSize") or banner.get("qr_size") or settings.QR_DEFAULT_SIZE
                output_path = f"sp_qr_{user_id}_{idx}.png"
                generate_banner_image(image_url, left, top, size, referral_link, output_path)
                paths.append(output_path)
        else:
            # fallback to CSV logic for backward compatibility
            processor = CSVImageProcessor(settings.CSV_URL)
            output_path = f"sp_qr_{user_id}.png"
            processor.process_and_save_image(referral_link, output_path)
            paths.append(output_path)

        return paths, referral_link

    def get_sales_point_profile(self, user_id: int) -> dict:
        return self.client.get(f"sales-point/bot/{user_id}")

    def remove_sales_point(self, user_id: int) -> bool:
        self.client.delete(f"sales-point/bot/{user_id}")
        return True