import json


def payload_sales_id(payload_str: str) -> str | None:
    """
    Если payload_str распарсился в JSON и содержит непустое поле "isSales",
    возвращает его значение (строку). Иначе — возвращает None.
    """
    try:
        data = json.loads(payload_str)
    except Exception:
        return None

    val = data.get("isSales")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None


def payload_form_type(payload_str: str) -> str | None:
    """Return form_type from payload JSON if provided."""
    try:
        data = json.loads(payload_str)
    except Exception:
        return None

    val = data.get("form_type")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return None