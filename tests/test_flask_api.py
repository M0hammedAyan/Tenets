"""
Tests for backend/flask_api.py — Flask API server.

Covers:
- /health reports telegram_configured correctly
- /api/telegram/test returns 503 when credentials are missing
- /api/telegram/test returns 200 when send_telegram_alert succeeds
- /api/telegram/test returns 500 when send_telegram_alert fails
- TELEGRAM_BOT_TOKEN is accepted as a fallback for TELEGRAM_TOKEN
"""
import importlib
import os
import sys

import pytest

# Ensure the repo root is on sys.path so `backend.flask_api` can be imported.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def _load_flask_api(monkeypatch, token=None, chat_id=None):
    """Import (or reload) backend.flask_api with specific env vars set."""
    # Set env before import so module-level variables pick them up.
    if token is not None:
        monkeypatch.setenv('TELEGRAM_TOKEN', token)
    else:
        monkeypatch.delenv('TELEGRAM_TOKEN', raising=False)
        monkeypatch.delenv('TELEGRAM_BOT_TOKEN', raising=False)

    if chat_id is not None:
        monkeypatch.setenv('TELEGRAM_CHAT_ID', chat_id)
    else:
        monkeypatch.delenv('TELEGRAM_CHAT_ID', raising=False)

    # Force re-import so module-level os.getenv() calls are re-evaluated.
    if 'backend.flask_api' in sys.modules:
        del sys.modules['backend.flask_api']

    import backend.flask_api as flask_api
    return flask_api


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _client(flask_api):
    """Return a Flask test client for the given flask_api module."""
    flask_api.app.config['TESTING'] = True
    return flask_api.app.test_client()


# ---------------------------------------------------------------------------
# /health — telegram_configured field
# ---------------------------------------------------------------------------

class TestHealthTelegramStatus:
    def test_telegram_configured_true_when_both_vars_set(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token='tok', chat_id='123')
        c = _client(flask_api)
        resp = c.get('/health')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['telegram_configured'] is True

    def test_telegram_configured_false_when_token_missing(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token=None, chat_id='123')
        c = _client(flask_api)
        resp = c.get('/health')
        data = resp.get_json()
        assert data['telegram_configured'] is False

    def test_telegram_configured_false_when_chat_id_missing(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token='tok', chat_id=None)
        c = _client(flask_api)
        resp = c.get('/health')
        data = resp.get_json()
        assert data['telegram_configured'] is False

    def test_telegram_configured_false_when_both_missing(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token=None, chat_id=None)
        c = _client(flask_api)
        resp = c.get('/health')
        data = resp.get_json()
        assert data['telegram_configured'] is False


# ---------------------------------------------------------------------------
# TELEGRAM_BOT_TOKEN fallback
# ---------------------------------------------------------------------------

class TestTelegramBotTokenFallback:
    def test_bot_token_accepted_as_fallback(self, monkeypatch):
        """Setting TELEGRAM_BOT_TOKEN (legacy name) should be treated as configured."""
        monkeypatch.delenv('TELEGRAM_TOKEN', raising=False)
        monkeypatch.setenv('TELEGRAM_BOT_TOKEN', 'legacy-token')
        monkeypatch.setenv('TELEGRAM_CHAT_ID', '999')

        if 'backend.flask_api' in sys.modules:
            del sys.modules['backend.flask_api']

        import backend.flask_api as flask_api
        assert flask_api.TELEGRAM_TOKEN == 'legacy-token'

        c = _client(flask_api)
        resp = c.get('/health')
        data = resp.get_json()
        assert data['telegram_configured'] is True


# ---------------------------------------------------------------------------
# POST /api/telegram/test
# ---------------------------------------------------------------------------

class TestTelegramTestEndpoint:
    def test_returns_503_when_credentials_missing(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token=None, chat_id=None)
        c = _client(flask_api)
        resp = c.post('/api/telegram/test')
        assert resp.status_code == 503
        data = resp.get_json()
        assert data['success'] is False
        assert 'TELEGRAM_TOKEN' in data['error']

    def test_returns_200_when_send_succeeds(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token='tok', chat_id='123')

        monkeypatch.setattr(flask_api, 'send_telegram_alert', lambda *a, **kw: True)

        c = _client(flask_api)
        resp = c.post('/api/telegram/test')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['success'] is True

    def test_returns_500_when_send_fails(self, monkeypatch):
        flask_api = _load_flask_api(monkeypatch, token='tok', chat_id='123')

        monkeypatch.setattr(flask_api, 'send_telegram_alert', lambda *a, **kw: False)

        c = _client(flask_api)
        resp = c.post('/api/telegram/test')
        assert resp.status_code == 500
        data = resp.get_json()
        assert data['success'] is False
