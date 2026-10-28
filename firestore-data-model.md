# Firestore data model

Collection: `orders`

Document ID: Firestore-generated ID.

Fields:

- `name`: string, required, 2–100 characters.
- `phone`: string, required, 7–25 characters.
- `address`: string, required, 5–300 characters.
- `notes`: string, required, at most 500 characters; empty string when omitted.
- `items`: list, required, 1–20 entries. Each entry has `name` (string), `price` (number), and `qty` (number).
- `total`: number, required, 0–1,000,000.
- `status`: string, required; one of `جديد`, `قيد التجهيز`, `تم التسليم`, `ملغي`.
- `createdAt`: Firestore timestamp, required; supplied by the server timestamp sentinel.

Access patterns:

- Unauthenticated customers create orders only.
- The Firebase Auth user whose UID is `JgSbRHZrbkSIcrlsfStxKvsDsEP2` reads, updates the status of, and deletes orders.
- The store dashboard orders by `createdAt` descending. Firestore rules authorize the owner; customer records are not publicly readable.
