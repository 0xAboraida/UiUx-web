<div dir="rtl" style="text-align: right;">

# 🔌 Zad API Endpoints — مرجع كامل للـ Frontend

**Base URL:** `https://abourida-zad-backend.hf.space/`

---

## 1️⃣ Auth — التسجيل والدخول

### POST `api/Auth/register`
تسجيل مستخدم جديد

**Request Body:**
<div dir="ltr">

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

</div>

**Response:**
<div dir="ltr">

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Ahmed"
  }
}
```

</div>

---

### POST `api/Auth/login`
تسجيل الدخول

**Request Body:**
<div dir="ltr">

```json
{
  "email": "string",
  "password": "string"
}
```

</div>

**Response:**
<div dir="ltr">

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Ahmed"
  }
}
```

</div>

---

## 2️⃣ Chat — المحادثة مع الـ RAG

### POST `api/v1/chat/ask`
إرسال سؤال للـ RAG Engine (الـ endpoint الأساسي للشات بوت)

**Request Body:**
<div dir="ltr">

```json
{
  "session_id": 0,
  "query": "ما حكم صلاة الجمعة؟",
  "domain": 1
}
```

</div>

**Domain Values:**

| الرقم | المجال |
|:---:|---:|
| 1 | فقه |
| 2 | العقيدة |
| 3 | السيرة |
| 4 | التفسير |
| 5 | الحديث |
| 6 | علوم القرآن |
| 7 | التاريخ |
| 8 | علوم اللغة |

**Response:**
<div dir="ltr">

```json
{
  "answer": "النص الكامل للإجابة...",
  "citations": {
    "1": {
      "book_title": "المغني",
      "madhhab": "حنبلي",
      "author": "ابن قدامة",
      "author_death": "620 هـ",
      "total_parts": 15,
      "part": "الجزء الثاني",
      "page_id": 245,
      "hierarchy": "كتاب الصلاة > باب صلاة الجمعة",
      "source_url": "https://..."
    }
  }
}
```

</div>

---

## 3️⃣ Chat Sessions — إدارة جلسات المحادثة

### POST `api/Chat/sessions`
إنشاء جلسة محادثة جديدة

**Request Body:**
<div dir="ltr">

```json
{
  "name": "اسم الجلسة (اختياري)"
}
```

</div>

**Response:**
<div dir="ltr">

```json
{
  "id": 1,
  "name": "جلسة فقهية",
  "createdAt": "2026-08-04T00:00:00Z",
  "messageCount": 0
}
```

</div>

---

### GET `api/Chat/sessions`
جلب كل جلسات المحادثة للمستخدم

**Response:**
<div dir="ltr">

```json
[
  {
    "id": 1,
    "name": "جلسة فقهية",
    "createdAt": "2026-08-04T00:00:00Z",
    "messageCount": 5
  },
  {
    "id": 2,
    "name": "أسئلة عقدية",
    "createdAt": "2026-08-03T00:00:00Z",
    "messageCount": 3
  }
]
```

</div>

---

### GET `api/Chat/sessions/{id}`
جلب تاريخ محادثة جلسة معينة

**Path Params:** `id` — رقم الجلسة

**Response:**
<div dir="ltr">

```json
{
  "session": {
    "id": 1,
    "name": "جلسة فقهية",
    "createdAt": "2026-08-04T00:00:00Z",
    "messageCount": 2
  },
  "messages": [
    {
      "id": 1,
      "question": "ما حكم صلاة الجمعة؟",
      "answer": "صلاة الجمعة فرض عين...",
      "citations": [
        {
          "bookTitle": "المغني",
          "madhhab": "حنبلي",
          "author": "ابن قدامة",
          "authorDeath": "620 هـ",
          "totalParts": 15,
          "part": "الجزء الثاني",
          "pageId": 245,
          "hierarchy": "كتاب الصلاة > باب الجمعة",
          "sourceUrl": "https://..."
        }
      ],
      "createdAt": "2026-08-04T01:00:00Z"
    }
  ]
}
```

</div>

---

### POST `api/Chat/sessions/{id}/messages`
إرسال رسالة في جلسة محددة

**Path Params:** `id` — رقم الجلسة

**Request Body:**
<div dir="ltr">

```json
{
  "query": "ما هي أركان الصلاة؟",
  "domain": 1
}
```

</div>

**Response:**
<div dir="ltr">

```json
{
  "id": 5,
  "question": "ما هي أركان الصلاة؟",
  "answer": "أركان الصلاة أربعة عشر ركنًا...",
  "citations": [
    {
      "bookTitle": "الشرح الممتع",
      "madhhab": "حنبلي",
      "author": "ابن عثيمين",
      "authorDeath": "1421 هـ",
      "totalParts": 15,
      "part": "الجزء الثالث",
      "pageId": 100,
      "hierarchy": "كتاب الصلاة > أركان الصلاة",
      "sourceUrl": "https://..."
    }
  ],
  "createdAt": "2026-08-04T01:30:00Z"
}
```

</div>

---

## 📋 ملخص سريع

<div dir="ltr">

| Method | Endpoint | الوصف |
|--------|----------|-------|
| `POST` | `api/Auth/register` | تسجيل مستخدم جديد |
| `POST` | `api/Auth/login` | تسجيل الدخول |
| `POST` | `api/v1/chat/ask` | سؤال RAG مباشر |
| `POST` | `api/Chat/sessions` | إنشاء جلسة جديدة |
| `GET`  | `api/Chat/sessions` | جلب كل الجلسات |
| `GET`  | `api/Chat/sessions/{id}` | جلب تاريخ جلسة |
| `POST` | `api/Chat/sessions/{id}/messages` | إرسال رسالة في جلسة |

</div>

> [!NOTE]
> الـ Token اللي بيرجع من `login`/`register` لازم يتبعت في الـ `Authorization` header كـ `Bearer {token}` في كل الـ requests التانية (الشات والجلسات).

</div>
