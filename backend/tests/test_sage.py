"""Unit and integration tests for the Mahabharata Multilingual AI Sage."""
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.sage.language import detect_language


@pytest.fixture
def client(settings):
    return TestClient(create_app(settings))


def test_language_detection():
    # English
    assert detect_language("My colleague is taking credit for my work.") == "en"
    assert detect_language("Should I report this to the regulator?") == "en"

    # Tamil
    assert detect_language("என் நண்பர் என்னை பொய் சொல்லச் சொல்கிறார்.") == "ta"
    assert detect_language("நான் எனது மேலாளரிடம் பேச வேண்டுமா?") == "ta"

    # Hindi
    assert detect_language("मेरे सहकर्मी ने मेरा काम चुरा लिया।") == "hi"
    assert detect_language("क्या मुझे प्रबंधक को सच बताना चाहिए?") == "hi"

    # Telugu
    assert detect_language("నా స్నేహితుడు పరీక్షలో కాపీ కొట్టాడు.") == "te"
    assert detect_language("నేను ఈ విషయాన్ని చెప్పాలా లేదా మౌనంగా ఉండాలా?") == "te"

    # Kannada
    assert detect_language("ನನ್ನ ಸಹೋದ್ಯೋಗಿ ನನ್ನ ಕೆಲಸದ ಗೌರವವನ್ನು ತಾವೇ ಪಡೆದುಕೊಂಡಿದ್ದಾರೆ.") == "kn"
    assert detect_language("ನಾನು ಮ್ಯಾನೇಜರ್‌ಗೆ ದೂರು ನೀಡಬೇಕೇ?") == "kn"

    # Malayalam
    assert detect_language("എന്റെ സുഹൃത്ത് തെറ്റ് മറച്ചുവെക്കാൻ എന്നോട് ആവശ്യപ്പെടുന്നു.") == "ml"
    assert detect_language("ഞാൻ എന്തു ചെയ്യണം?") == "ml"


def test_sage_languages_endpoint(client):
    r = client.get("/api/sage/languages")
    assert r.status_code == 200
    data = r.json()
    codes = [l["code"] for l in data["languages"]]
    assert set(codes) == {"en", "ta", "hi", "te", "kn", "ml"}
    assert "section_titles" in data


def test_sage_consult_english(client):
    payload = {
        "dilemma": "My close friend asked me to lie to our manager about why they missed a critical safety inspection. If I tell the truth, they might be fired. If I lie, I violate workplace safety and my own honesty.",
        "target_language": "en",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["selected_language"] == "en"
    assert data["detected_language"] == "en"
    assert data["sources_found"] is True
    assert data["source_count"] > 0

    ans = data["answer"]
    assert len(ans["understanding"]) > 10
    assert len(ans["ethical_analysis"]) > 10
    assert len(ans["mahabharata_connection"]) > 10
    assert len(ans["source_evidence"]) > 0
    assert len(ans["possible_solution"]) > 10
    assert len(ans["alternative_perspective"]) > 10

    # Verify citation integrity
    for src in ans["source_evidence"]:
        assert src["source"] in ("Mahabharata", "Bhagavad Gita")
        assert len(src["citation"]) > 0


def test_sage_consult_multilingual_tamil(client):
    payload = {
        "dilemma": "என் சக ஊழியர் நான் செய்த வேலையை தனது வேலை என்று மேலாளரிடம் கூறிவிட்டார். நான் அவரிடம் நேரடியாக பேசவா அல்லது மேலாளரிடம் சொல்லவா?",
        "target_language": "ta",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["detected_language"] == "ta"
    assert data["selected_language"] == "ta"
    assert data["sources_found"] is True

    ans = data["answer"]
    # Verify Tamil script presence
    assert any(0x0B80 <= ord(c) <= 0x0BFF for c in ans["understanding"])
    assert any(0x0B80 <= ord(c) <= 0x0BFF for c in ans["mahabharata_connection"])


def test_sage_consult_multilingual_hindi(client):
    payload = {
        "dilemma": "मेरे मित्र ने परीक्षा में नकल की और मुझसे कहा कि मैं किसी को न बताऊं। क्या मुझे चुप रहना चाहिए?",
        "target_language": "hi",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["detected_language"] == "hi"
    assert data["selected_language"] == "hi"
    ans = data["answer"]
    # Verify Devanagari script presence
    assert any(0x0900 <= ord(c) <= 0x097F for c in ans["understanding"])


def test_sage_consult_unanswerable_query(client):
    payload = {
        "dilemma": "What is the capital city of France and what is the current weather there?",
        "target_language": "en",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()

    # Must transparently state no scriptural match
    assert data["sources_found"] is False
    assert len(data["answer"]["source_evidence"]) == 0
    assert "No direct scriptural" in data["answer"]["ethical_analysis"] or "No direct" in data["answer"]["mahabharata_connection"]


def test_sage_session_history_and_clear(client):
    session_id = "test-session-123"
    payload = {
        "dilemma": "Should I report my colleague who is cutting corners on a medical firmware device?",
        "target_language": "en",
        "session_id": session_id,
    }
    r1 = client.post("/api/sage/consult", json=payload)
    assert r1.status_code == 200
    assert r1.json()["session_id"] == session_id

    # Get history
    rh = client.get(f"/api/sage/history/{session_id}")
    assert rh.status_code == 200
    history = rh.json()
    assert history["session_id"] == session_id
    assert len(history["messages"]) >= 2  # user + sage
    assert history["messages"][0]["role"] == "user"
    assert history["messages"][1]["role"] == "sage"

    # Delete history
    rd = client.delete(f"/api/sage/history/{session_id}")
    assert rd.status_code == 200
    assert rd.json()["deleted"] == session_id

    # Verify history is now empty
    rh2 = client.get(f"/api/sage/history/{session_id}")
    assert len(rh2.json()["messages"]) == 0


def test_sage_consult_diet_ethics_non_veg(client):
    """Verifies that asking 'i eat non veg is that dharma?' returns grounded Mahabharata evidence."""
    payload = {
        "dilemma": "i eat non veg is that dharma?",
        "target_language": "en",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()

    assert data["sources_found"] is True
    assert data["source_count"] >= 1
    citations = [s["citation"] for s in data["answer"]["source_evidence"]]
    assert any("Vana Parva" in c or "Dharmavyadha" in c or "Anushasana" in c or "17" in c for c in citations)
    assert "Dharmavyadha" in data["answer"]["mahabharata_connection"] or "ahimsa" in data["answer"]["ethical_analysis"].lower()
    assert len(data["answer"]["possible_solution"]) > 20
    assert len(data["answer"]["alternative_perspective"]) > 20


def test_sage_consult_too_short(client):
    """Verifies that dilemma shorter than 5 characters returns validation error."""
    r = client.post("/api/sage/consult", json={"dilemma": "hi", "target_language": "en"})
    assert r.status_code in (400, 422)


def test_sage_consult_concise_format_fields(client):
    """Verifies that Phase 6 concise fields (short_answer, why, what_you_can_do) are populated."""
    payload = {
        "dilemma": "I discovered that my business partner has been misleading our investors about our quarterly growth numbers.",
        "target_language": "en",
    }
    r = client.post("/api/sage/consult", json=payload)
    assert r.status_code == 200
    data = r.json()
    ans = data["answer"]

    # Check concise 4-part structure
    assert ans["short_answer"] and len(ans["short_answer"]) > 10
    assert ans["why"] and len(ans["why"]) > 10
    assert ans["mahabharata_connection"] and len(ans["mahabharata_connection"]) > 10
    assert isinstance(ans["what_you_can_do"], list)
    assert len(ans["what_you_can_do"]) >= 1
    for step in ans["what_you_can_do"]:
        assert len(step) > 5

    # Check backward compatibility fields remain available
    assert ans["understanding"] and len(ans["understanding"]) > 10
    assert ans["ethical_analysis"] and len(ans["ethical_analysis"]) > 10
    assert ans["possible_solution"] and len(ans["possible_solution"]) > 10


def test_sage_audio_endpoint_fallback(client):
    """Verifies that /api/sage/audio gracefully returns fallback when Sarvam key is absent."""
    payload = {
        "text": "Speak the truth and adhere to righteousness.",
        "language": "en",
    }
    r = client.post("/api/sage/audio", json=payload)
    assert r.status_code == 200
    data = r.json()
    # In test environment without Sarvam key, it should fallback to browser speech synthesis
    assert data["provider"] in ("browser_fallback", "sarvam")
    if data["provider"] == "browser_fallback":
        assert data["supported"] is False
        assert "fallback" in data["message"].lower()


def test_sage_audio_endpoint_mock_sarvam(client, monkeypatch):
    """Verifies that /api/sage/audio correctly returns base64 audio when Sarvam API responds."""
    import httpx
    from app.core.config import Settings

    # Mock effective_sarvam_api_key to return a test key
    monkeypatch.setattr(Settings, "effective_sarvam_api_key", property(lambda self: "mock-sarvam-key"))

    class MockResponse:
        status_code = 200
        def json(self):
            return {"audios": ["UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="]}
        @property
        def text(self):
            return ""

    async def mock_post(*args, **kwargs):
        return MockResponse()

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    payload = {
        "text": "சத்தியத்தைப் பேசுங்கள், தர்மத்தைப் பின்பற்றுங்கள்.",
        "language": "ta",
    }
    r = client.post("/api/sage/audio", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["supported"] is True
    assert data["provider"] == "sarvam"
    assert data["audio_base64"] == "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
    assert data["format"] == "audio/wav"


def test_sage_audio_validation_error(client):
    """Verifies that empty or whitespace-only text returns 400/422."""
    r = client.post("/api/sage/audio", json={"text": "   ", "language": "en"})
    assert r.status_code in (400, 422)


