import random
import re
from .backend_client import BackendClient
from .banner_service import BannerService
from newBot.lib.image_processor import CSVImageProcessor, generate_banner_image
from newBot.config import settings


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
        outlet_type: str = "SELLER",
        telegram_id: str | None = None,
        link: str | None = None,
    ) -> dict:
        """Create a sales outlet with extended data."""
        payload = {
            "partnerId": partner_id,
            "name": name,
            "address": address,
            "description": description,
            "type": outlet_type,
            "telegramId": telegram_id,
            "link": link,
        }
        return self.client.post("sales-outlet", payload)

    def update_outlet(self, outlet_id: int, data: dict) -> None:
        self.client.put(f"sales-outlet/{outlet_id}", data)

    def generate_referral_assets(self, name: str, referral_link: str) -> tuple[list[str], str]:
        """Generate QR code and up to two banners for the outlet."""
        safe = re.sub(r"[^A-Za-z0-9_]+", "_", name) or "outlet"

        banner_service = BannerService()
        banners = banner_service.list_banners()

        paths: list[str] = []
        if banners:
            selected = random.sample(banners, min(2, len(banners)))
            for idx, banner in enumerate(selected, 1):
                image_url = banner.get("imageUrl") or banner.get("image_url")
                left = banner.get("qrLeftOffset") or banner.get("qr_left_offset") or 0
                top = banner.get("qrTopOffset") or banner.get("qr_top_offset") or 0
                size = banner.get("qrSize") or banner.get("qr_size") or settings.QR_DEFAULT_SIZE
                output_path = f"{safe}_banner_{idx}.png"
                generate_banner_image(image_url, left, top, size, referral_link, output_path)
                paths.append(output_path)
        else:
            processor = CSVImageProcessor(settings.CSV_URL)
            output_path = f"{safe}_banner.png"
            processor.process_and_save_image(referral_link, output_path)
            paths.append(output_path)

        qr_processor = CSVImageProcessor(settings.CSV_URL)
        qr_output = f"{safe}_qr.png"
        qr_img = qr_processor.generate_qr_code(referral_link, settings.QR_DEFAULT_SIZE)
        qr_img.save(qr_output)

        return paths, qr_output

