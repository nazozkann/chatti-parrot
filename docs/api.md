# API

## GET /api/words

- Açıklama: Kelimeleri listeler
- Yanıt: `200 OK`

```json
[
  {
    "de": "Apfel",
    "en": "apple",
    "tr": "elma",
    "artikel": "der",
    "plural": "Äpfel"
  }
]
payload;
{ "de":"rot", "en":"red", "tr":"kırmızı" }

response: 201 Created
```
