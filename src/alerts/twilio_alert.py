from twilio.rest import Client
import os

class FloodAlertSystem:
    def __init__(self, account_sid=None, auth_token=None):
        self.account_sid = account_sid or os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = auth_token or os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid else None
    
    def send_flood_alert(self, phone_numbers, location="your area"):
        """Send SMS alert when flood risk is High."""
        if not self.client:
            print("Twilio client not configured")
            return
        
        message_body = f"⚠ Flood Warning: High flood risk predicted in {location}. Stay alert."
        
        results = []
        for phone in phone_numbers:
            try:
                message = self.client.messages.create(
                    body=message_body,
                    from_=self.from_number,
                    to=phone
                )
                results.append({'phone': phone, 'status': 'sent', 'sid': message.sid})
            except Exception as e:
                results.append({'phone': phone, 'status': 'failed', 'error': str(e)})
        
        return results
