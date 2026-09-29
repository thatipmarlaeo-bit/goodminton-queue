# สไลด์นำเสนอ Mini Project OOP — ระบบคิวสนามแบดมินตัน (GoodmintonQ)

> เงื่อนไขส่งงาน: สไลด์ต้องแสดง `ระบบคืออะไร` / `Feature อะไรบ้าง` / `หลักการ OOP อยู่ที่ class/บรรทัดใด`
> รวม 20 คะแนน, เวลานำเสนอ ~10-15 นาที (แนะนำ 12 นาที + demo 3 นาที)
> กลุ่ม 3 คน → แบ่งหัวข้อ: ระบบA / OOP-B / Demo-C

---

## สไลด์ 1 — ปก
```
ระบบคิวสนามแบดมินตัน (GoodmintonQ)
Mini Project — การเขียนโปรแกรมเชิงวัตถุ
กลุ่ม ____ | สมาชิก 3 คน
GitHub: <repository link>
```

---

## สไลด์ 2 — โจทย์ปัญหา (Why)
- ผู้เล่นแบดมินตันต้อง "นั่งรอคิว" หน้าสนาม ไม่รู้ว่าคิวตัวเองถึงเมื่อไหร่
- แอดมินจดบัญชีคิวด้วยกระดาษ — ยุ่ง, ลืม, ลำดับผิด
- ต้องการระบบคิวจริงที่ **จัดลาดับอัตโนมัติ + แจ้งเตือนถึงมือถือ**

→ เลือกพัฒนาเป็นเว็บแอป (GUI) + ฐานข้อมูลบนคลาวด์ (Supabase)

---

## สไลด์ 3 — ระบบคืออะไร (What)
- ผู้เล่น: สร้าง/เข้าร่วมคิว ได้สูงสุด 4 คนต่อคู่
- ระบบตัดสินใจโดยเรียกคิวที่รอนานสุดขึ้นสนามว่างอัตโนมัติ (FIFO)
- แจ้งเตือนเมื่อถึงคิว (in-app realtime)
- แอดมิน: เปิด/ปิดสนาม, สลับสนาม, เริ่ม/จบเกม, บันทึกเลขลูกแบด, เก็บสถานะจ่ายเงิน

**Demo หลักคิดเป็นภาพ:** 4 ได้คอร์ต → 5 สร้างคิว → พอคอร์ตว่าง 12 → 5 ถูกเรียกอัตโนมัติ

---

## สไลด์ 4 — Feature หลัก (What — ต่อ)
| ฝั่งผู้เล่น | ฝั่งแอดมิน |
|---|---|
| ดูสถานะสนาม + จำนวนคนในสนาม | จัดการคิว (เพิ่ม/เอาผู้เล่นออก) |
| สร้างคิว / เข้าร่วมคิว / ยกเลิก | เริ่มเกม → เปิดคอร์ตเองอัตโนมัติ | คอร์ตผ่าน trigger |
| รอคิว → ถูกเรียกอัตโนมัติ | สลับสนามระหว่างเล่น |
| ประวัติการเล่น / สถิติชนะ-แพ้-เสมอ | จบเกม + บันทึกผู้ชนะ |

---

## สไลด์ 5 — Architecture (ภาพรวม)
```
┌──────────────┐   ┌──────────────┐
│  PlayerView   │   │  AdminView   │   ← Vue 3 GUI
└──────┬───────┘   └──────┬───────┘
       └─────────┬────────┘
               ▼
   ┌─────────────────────────┐
   │   UserService   │  QueueService  │   ← OOP service layer (extends BaseService)
   └─────────────────────────┘
               ▼
   ┌─────────────────────────┐
   │  Queue / QueuePlayer    │   ← domain model (encapsulation)
   └─────────────────────────┘
               ▼
        Supabase (DB + SQL triggers auto-call)
```

---

## สไลด์ 6 — Class Diagram (ตรงกับโค้ด)

```
        ┌────────────────────┐
        │    BaseService      │          <<abstract>>
        ├────────────────────┤
        │ - #client           │   Encapsulation
        │ + getClient/setClient│
        │ + getTableName()✗   │   Polymorphism (abstract → override)
        └────────┬────────────┘
        ┌────────┴───────────┐
        ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│   UserService     │  │   QueueService    │
├──────────────────┤  ├──────────────────┤
│ + getTableName()→'profiles'│ │ + getTableName()→'queues'│  ← Override
│ + saveProfile()  │  │ + getActiveQueues()│
│ + getProfile()   │  │ + createQueue()   │
│ + ensureIdentity()│ │ + joinQueue()     │
└──────────────────┘  │ + startMatch()    │
        extends (UserService.js:5)  └─┬───────────┬────┘
        extends (QueueService.js:6)   │   uses    │ uses
                             ┌───────▼─────────▼─────┐
                             │        Queue            │ 1──*  QueuePlayer
                             ├────────────────────────┤
                             │ - #id #status ...       │
                             │ - #players              │  ← private fields
                             │ + isFull() isReadyToPlay()│ ← getters
                             └────────────────────────┘
```
> เน้น: 2 สายสืบทอด (UserService/QueueService → BaseService), composition Queue→QueuePlayer, และ `QueueService.getActiveQueues()` ใช้ `new Queue(row)` จริง (QueueService.js:28)

---

## สไลด์ 7 — OOP 1: Encapsulation (ซ่อนข้อมูล)

**เกณฑ์:** private/protected + เข้าถึงผ่าน method/getter-setter

```js
// BaseService.js:10-22
export class BaseService {
  #client                       // ← private field — ภายนอกเข้าไม่ถึง
  get client() { return this.#client }   // getter
  set client(v) { this.#client = v }     // setter
}
```
```js
// Queue.js:62-142
class Queue {
  #players                       // ← private
  get players() { return this.#players }
  set players(v) { this.#players = v.map(p => new QueuePlayer(p)) }  // กันข้อมูลเพี้ยน
}
```
**พูดสั้น ๆ:** ไม่มีใครเซ็ต `queue.#players = garbage` ได้ ต้องผ่าน setter ซึ่งบังคับสร้าง `QueuePlayer` ที่ถูกต้องเสมอ

---

## สไลด์ 8 — OOP 2: Inheritance (สืบทอด)

**เกณฑ์:** อย่างน้อย 1 สาย — เรามี 2 สาย

```js
// UserService.js:5
export class UserService extends BaseService {
  constructor(client = supabase) { super(client) }   // เรียก constructor พ่อ
}
```
```js
// QueueService.js:6
export class QueueService extends BaseService {
  constructor(client = supabase) { super(client) }
}
```
- ลูกทั้งสองได้ `#client` + getter/setter จากพ่อโดยไม่ต้องเขียนซ้ำ
- เพิ่ม service ใหม่ในอนาคต = แค่ extends เดียวกัน → **reuse code**

---

## สไลด์ 9 — OOP 3: Polymorphism (Override)

**เกณฑ์:** Overload หรือ Override — เราใช้ **Override**

```js
// BaseService.js:24 — กำหนด "สัญญา" บังคับลูก override
getTableName() { throw new Error('ต้อง override getTableName() ใน subclass') }

// UserService.js:11
getTableName() { return 'profiles' }   // map: ผู้ใช้ → ตาราง profiles

// QueueService.js:13
getTableName() { return 'queues' }     // map: คิว → ตาราง queues
```
**จุดที่พิสูจน์ว่างานจริง:** 24 ตำแหน่งเรียก `this.client.from(this.getTableName())`
- เรียกผ่าน service ตัวเดียวกัน แต่ผลลัพธ์การอ้างตารางคนละตัว
- เพราะ runtime dispatch → ตัวที่ถูก override ของ subclass นั้นถูกเรียก

**โบนัส Overload:** `Queue.js:140-142` — `set players(v)` รับได้ทั้ง raw row และ instance `QueuePlayer`

```js
set players(v) { this.#players = v.map(p => p instanceof QueuePlayer ? p : new QueuePlayer(p)) }
```

---

## สไลด์ 10 — OOP 4: Abstraction (ไม่ประเมิน แต่มี)

- `BaseService` เป็น "แม่แบบ" — กำหนดโครงสร้าง (มี client, ต้องมี tableName)
- ลูกแต่ละตัวเติมรายละเอียดให้ครบ
- ใช้หลักการ template method: พ่อเขียนกรอบงาน, ลูกเติมของเฉพาะ

> ข้อสอบให้ note: "Abstraction ไม่ประเมิน" แต่โชว์ไว้=ได้ฟรี

---

## สไลด์ 11 — ตารางสรุป "OOP หลักการกับโค้ด" (ใช้ปากกาชี้จุด)

| หลักการ | จุดชี้ในโค้ด | พูดอย่างไร |
|---|---|---|
| Inheritance | `UserService.js:5`, `QueueService.js:6`, `BaseService.js` | "ทั้งสอง extends BaseService, เรียก super(client)" |
| Polymorphism | `BaseService.js:24`, `UserService.js:11`, `QueueService.js:13` | "override getTableName คืนต่างกัน, เรียกจริง 24 จุด" |
| Encapsulation | `BaseService.js:10`, `Queue.js:62-142` | "#field + getter/setter, setter บังคับ validation" |
| ≥5 class + diagram | 5 class ในสไลด์ 6 | "Queue/QueuePlayer ถูกใช้จริงที่ QueueService.js:28" |

---

## สไลด์ 12 — Demo Script (3 นาที ใช้ site จริง)

| # | Step | เห็นผลที่ GUI |
|---|---|---|
| 1 | Admin เปิดสนาม A | คอร์ต A สีเขียว "ว่าง" |
| 2 | ผู้เล่น ก/ข/ค/ง สร้างคิว | คิวสร้าง + auto-call trigger → 4 คนถูกเรียกขึ้นคอร์ต A |
| 3 | ผู้เล่น จ สร้างคิว (ขณะ A กำลังเล่น) | คิว จ รออยู่อันดับถัดไป + แสดงเวลารอโดยประมาณ |
| 4 | Admin กด "จบเกม" | คอร์ตว่าง → คิว จ ถูกเรียกอัตโนมัติ |
| 5 | Admin กดประวัติคิว | เห็นสถานะใกล้จบ + ผู้ชนะ + เลขลูกแบด |
| 6 | ผู้เล่น ก เปิดโปรไฟล์ | เห็นสถิติ เล่น/ชนะ/เสมอ อัปเดต |

---

## สไลด์ 13 — บทสรุป (1 ข้อพูดจบ)

> "ระบบนี้ทำงานจริง ตั้งแต่ผู้เล่นสร้างคิวจนถึงจบเกม โดยออกแบบเป็น class 5 class ที่แบ่งหน้าที่ชัดเจน ใช้ Inheritance 2 สาย Polymorphism ผ่าน override getTableName และ Encapsulation ผ่าน private+getter/setter ทุกจุด — ทุกบรรทัดที่อ้าง พร้อมเปิดให้ตรวจได้"

---

## สไลด์ 14 — Q&A / ขอบคุณ

---

## Hint สำหรับสไลด์ (ทำโดยกลุ่ม)
1. ทำเป็น Google Slides/Canva — โค้ดใส่ใน text box `ฟอนต์ monospace` + highlight บรรทัดสำคัญด้วยสี
2. ใช้ diagram จริงจากสไลด์ 6 — วาดเป็นภาพไม่ต้องพึ่ง emoji
3. ระหว่าง demo เปิด code อยู่ข้างหลัง (สองจอ) เพื่อชี้บรรทัดให้เห็นชัด
4. แบ่งพูด: คน 1=ระบบ/Feature, คน 2=OOP+โค้ด, คน 3=demo+ประวัติ commit ใน GitHub
5. ดึงภาพ screenshot จริงจาก http://localhost:5173 มาแปะแทนสเปกข้อความ