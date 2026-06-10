# Pubblica clients/blackstar.json sul Blob LIVE che usa il sito (clients/blackstardigital.json).
# ⚠️ Il widget su blackstardigitalstudio.com legge il BLOB, NON il file nel repo Vercel.
# Flusso per aggiornare il bot di Black Star:
#   1) modifica  D:\chatbot\clients\blackstar.json
#   2) lancia    python3 publish-blackstar.py
#   3) il sito si aggiorna entro ~60s (cache Blob). Hard refresh per vederlo subito.
import json, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SAVE = "https://aiseller-blackstar.vercel.app/api/save"
BLOB_ID = "blackstardigital"   # → clients/blackstardigital.json sul Blob (NON "blackstar")

cfg = json.load(open(r"D:\chatbot\clients\blackstar.json", encoding="utf-8"))
payload = json.dumps({"id": BLOB_ID, "config": cfg}).encode("utf-8")
req = urllib.request.Request(SAVE, data=payload, headers={"Content-Type": "application/json"}, method="POST")
print(urllib.request.urlopen(req, context=ctx).read().decode())
