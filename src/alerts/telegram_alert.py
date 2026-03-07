import os
import requests

from config.config import TELEGRAM_CONFIG, SAFE_LOCATION


def _get_credentials():
    """Return (token, chat_id) loaded from config or environment."""
    token = TELEGRAM_CONFIG.get('token') or os.getenv('TELEGRAM_TOKEN')
    chat_id = TELEGRAM_CONFIG.get('chat_id') or os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        raise RuntimeError("Telegram credentials not configured")
    return token, chat_id


def send_message(text: str):
    """Send a plain text message to the configured Telegram chat."""
    token, chat_id = _get_credentials()
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    resp = requests.post(url, data={
        "chat_id": chat_id,
        "text": text
    })
    resp.raise_for_status()
    return resp.json()


def send_location(lat: float, lon: float):
    """Send a location pin to the Telegram chat."""
    token, chat_id = _get_credentials()
    url = f"https://api.telegram.org/bot{token}/sendLocation"
    resp = requests.post(url, data={
        "chat_id": chat_id,
        "latitude": lat,
        "longitude": lon
    })
    resp.raise_for_status()
    return resp.json()


def alert_high_risk(district: str = None, extra_text: str = None,
                    safe_lat: float = None, safe_lon: float = None):
    """Convenience function for the standard high‑risk flood alert.

    Parameters
    ----------
    district : optional textual name of the affected district
    extra_text : optional additional text to append to message
    safe_lat, safe_lon : if provided, override the configured safe location and
        include a live map link (and send a location pin).
    """
    msg = "🚨 *HIGH FLOOD RISK* 🚨\nThere is high risk of flood - you must evacuate!"
    if district:
        msg += f"\nLocation: {district}"
    if extra_text:
        msg += f"\n{extra_text}"

    # determine which safe coordinates to use
    if safe_lat is not None and safe_lon is not None:
        msg += f"\nSafe location: https://www.google.com/maps?q={safe_lat},{safe_lon}"
        # also send a location pin after the text
        send_message(msg)
        send_location(safe_lat, safe_lon)
        return

    # fallback to config values
    lat = SAFE_LOCATION.get('latitude')
    lon = SAFE_LOCATION.get('longitude')
    if lat and lon:
        msg += f"\nSafe location: https://www.google.com/maps?q={lat},{lon}"
    return send_message(msg)
