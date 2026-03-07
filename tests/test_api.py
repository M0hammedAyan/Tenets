import os

from fastapi.testclient import TestClient

import backend.api as api_module

# ensure environment variables exist so that telegram service doesn't crash
os.environ.setdefault('TELEGRAM_TOKEN', 'dummy')
os.environ.setdefault('TELEGRAM_CHAT_ID', '12345')

client = TestClient(api_module.app)


# dummy model that always returns a high risk score
class DummyModel:
    def predict_proba(self, features):
        return [[0.1, 0.9]]


def test_high_risk_triggers_telegram(monkeypatch):
    # override model to always produce high probability
    class DummyModel:
        def predict_proba(self, features):
            return [[0.1, 0.9]]

    api_module.model = DummyModel()

    called = {}

    def fake_alert_high_risk(*args, **kwargs):
        called['args'] = args
        called['kwargs'] = kwargs

    monkeypatch.setattr(api_module, 'alert_high_risk', fake_alert_high_risk)

    resp = client.post("/predict", json={
        "rainfall_3hr": 10,
        "rainfall_24hr": 50,
        "soil_moisture": 30,
        "elevation": 100,
        "slope": 5,
        "river_proximity": 2,
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["risk_level"] == "High"
    assert called, "alert_high_risk was not called"


def test_lat_lon_passed_to_alert(monkeypatch):
    # model returns high risk again
    api_module.model = DummyModel()
    recorded = {}
    def fake_alert_high_risk(*args, **kwargs):
        recorded['kwargs'] = kwargs
    monkeypatch.setattr(api_module, 'alert_high_risk', fake_alert_high_risk)

    resp = client.post("/predict", json={
        "rainfall_3hr": 1,
        "rainfall_24hr": 2,
        "soil_moisture": 10,
        "elevation": 50,
        "slope": 1,
        "river_proximity": 0.5,
        "latitude": 12.0,
        "longitude": 77.0,
    })
    assert resp.status_code == 200
    assert recorded.get('kwargs')
    # safe coordinates should be offset by 0.05
    assert recorded['kwargs'].get('safe_lat') == 12.05
    assert recorded['kwargs'].get('safe_lon') == 77.05
