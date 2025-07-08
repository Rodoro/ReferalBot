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
        """Sign agent contract and return referral assets for both agent and sales point."""

        # --- Sign the consultant (agent) contract and create partner link ---
        profile = self.get_agent_profile(user_id)
        code = profile.get("referralCode")
        if not code:
            code = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))

        self.client.put(
            f"agent/bot/{user_id}", {"contractSigned": True, "referralCode": code}
        )

        agent_link = f"https://t.me/{settings.BOT_USERNAME}?start=ref_{code}"
        qr_processor = CSVImageProcessor(settings.CSV_URL)
        agent_qr = f"agent_qr_{user_id}_plain.png"
        qr_image = qr_processor.generate_qr_code(agent_link, settings.QR_DEFAULT_SIZE)
        qr_image.save(agent_qr)

        # --- Retrieve sales point referral data for client links ---
        sp_paths: list[str] = []
        sp_qr_output = ""
        sp_referral_link = ""

        points = self.list_agent_points(user_id)
        if points:
            sp_user_id = (
                points[0].get("userId")
                or points[0].get("user_id")
                or points[0].get("id")
                or user_id
            )

            sp_service = SalesPointService()
            sp_profile = sp_service.get_sales_point_profile(sp_user_id)
            sp_code = sp_profile.get("referralCode") if isinstance(sp_profile, dict) else None

            # If referral code exists, just generate images; otherwise try to sign the point
            if not sp_code:
                try:
                    sp_paths, sp_qr_output, sp_referral_link = sp_service.sign_sales_point_contract(
                        sp_user_id
                    )
                    sp_code = sp_referral_link.split("ref_")[-1]
                except Exception:
                    sp_code = None

            if sp_code:
                if not sp_referral_link:
                    sp_referral_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{sp_code}"

                banner_service = BannerService()
                banners = banner_service.list_banners()

                if banners:
                    selected = random.sample(banners, min(2, len(banners)))
                    for idx, banner in enumerate(selected):
                        image_url = banner.get("imageUrl") or banner.get("image_url")
                        left = banner.get("qrLeftOffset") or banner.get("qr_left_offset") or 0
                        top = banner.get("qrTopOffset") or banner.get("qr_top_offset") or 0
                        size = banner.get("qrSize") or banner.get("qr_size") or settings.QR_DEFAULT_SIZE
                        output_path = f"sp_qr_{sp_user_id}_{idx}.png"
                        generate_banner_image(image_url, left, top, size, sp_referral_link, output_path)
                        sp_paths.append(output_path)
                else:
                    processor = CSVImageProcessor(settings.CSV_URL)
                    output_path = f"sp_qr_{sp_user_id}.png"
                    processor.process_and_save_image(sp_referral_link, output_path)
                    sp_paths.append(output_path)

                sp_qr_output = f"sp_qr_{sp_user_id}_plain.png"
                qr_image = qr_processor.generate_qr_code(sp_referral_link, settings.QR_DEFAULT_SIZE)
                qr_image.save(sp_qr_output)

        # Fallback to agent code if we could not determine the sales point link
        if not sp_referral_link:
            sp_referral_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"
            sp_qr_output = f"sp_qr_{user_id}_plain.png"
            qr_image = qr_processor.generate_qr_code(sp_referral_link, settings.QR_DEFAULT_SIZE)
            qr_image.save(sp_qr_output)

        return sp_paths, sp_qr_output, sp_referral_link, agent_qr, agent_link
    
    def get_agent_profile(self, user_id: int) -> dict:
        """Return agent profile for the given user id."""
        user = self.client.get(f"user/bot/{user_id}")
        return user.get("agent", {}) if isinstance(user, dict) else {}

    def list_agent_points(self, user_id: int) -> list[dict]:
        """List sales points for an agent using the user's identifier."""
        profile = self.get_agent_profile(user_id)
        agent_id = profile.get("id") if isinstance(profile, dict) else None
        if not agent_id:
            return []
        resp = self.client.get(f"agent/bot/{agent_id}/points")
        return resp if isinstance(resp, list) else resp.get("items", [])

    def remove_agent(self, user_id: int) -> bool:
        self.client.delete(f"agent/bot/{user_id}")
        return True
    
    def get_agent_by_code(self, code: str) -> dict:
        return self.client.get(f"agent/ref/{code}")