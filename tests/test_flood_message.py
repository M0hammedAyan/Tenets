import os
import sys
import pickle

import pytest

# ensure alerts package is on path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

import src.alerts.flood_message as fm


class DummyModel:
    def predict_proba(self, features):
        return [[0.1, 0.9]]


def test_script_alerts_high_risk(monkeypatch, tmp_path, capsys):
    # monkeypatch the model loader to return a DummyModel instance
    monkeypatch.setattr(fm, 'load_model', lambda: DummyModel())

    called = {}
    def fake_alert_high_risk(*args, **kwargs):
        called['args'] = args
        called['kwargs'] = kwargs

    monkeypatch.setattr(fm, 'alert_high_risk', fake_alert_high_risk)
    # run main with synthetic arguments
    monkeypatch.setattr(sys, 'argv', [
        'flood_message.py',
        '1', '2', '3', '4', '5', '6',
        '12.0', '77.0'
    ])

    fm.main()
    # ensure alert was called and safe coords offset
    assert called, "alert_high_risk not called"
    assert called['kwargs']['safe_lat'] == pytest.approx(12.05)
    assert called['kwargs']['safe_lon'] == pytest.approx(77.05)


def test_script_no_alert_on_low(monkeypatch, tmp_path):
    # monkeypatch a low-risk model
    class LowModel:
        def predict_proba(self, features):
            return [[0.9, 0.1]]
    monkeypatch.setattr(fm, 'load_model', lambda: LowModel())

    called = False
    def fake_alert_high_risk(*args, **kwargs):
        nonlocal called
        called = True

    monkeypatch.setattr(fm, 'alert_high_risk', fake_alert_high_risk)
    monkeypatch.setattr(sys, 'argv', [
        'flood_message.py',
        '1', '2', '3', '4', '5', '6'
    ])
    fm.main()
    assert not called, "alert should not fire for low risk"