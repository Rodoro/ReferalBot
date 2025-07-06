from newBot.config import settings
from .backend_client import BackendClient
from .banner_service import BannerService
from newBot.lib.image_processor import CSVImageProcessor, generate_banner_image
from typing import List, Tuple
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

    def sign_sales_point_contract(self, user_id: int) -> tuple[list[str], str, str]:
        profile = self.get_sales_point_profile(user_id)
        code = profile.get("referralCode") or "".join(
            random.choices(string.ascii_lowercase + string.digits, k=8)
        )
        self.client.put(
            f"sales-point/bot/{user_id}", {"contractSigned": True}
        )

        partner_id = profile.get("id")
        from .sales_outlet_service import SalesOutletService
        outlet_svc = SalesOutletService()
        outlets = outlet_svc.list_outlets(partner_id)
        if outlets:
            outlet_svc.update_outlet(outlets[0].get("id"), {"referralCode": code})

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
        # plain QR code
        qr_processor = CSVImageProcessor(settings.CSV_URL)
        qr_output = f"sp_qr_{user_id}_plain.png"
        qr_image = qr_processor.generate_qr_code(referral_link, settings.QR_DEFAULT_SIZE)
        qr_image.save(qr_output)

        return paths, qr_output, referral_link

    def get_sales_point_profile(self, user_id: int) -> dict:
        return self.client.get(f"sales-point/bot/{user_id}")

    def remove_sales_point(self, user_id: int) -> bool:
        self.client.delete(f"sales-point/bot/{user_id}")
        return True