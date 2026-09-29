// src/models/Queue.js
// OOP:
//   - Encapsulation : field เป็น private (#) เข้าถึงผ่าน getter/setter ทั้งหมด
//   - ชื่อ field เดิม (deviceId, nickname, ...) ถูก mapping จาก raw row ของ view
export class QueuePlayer {
  #deviceId
  #nickname
  #avatarId
  #role
  #faculty

  constructor({ device_id, nickname, avatar_id, role, faculty }) {
    this.#deviceId = device_id
    this.#nickname = nickname || 'ไม่ระบุชื่อ'
    this.#avatarId = avatar_id || 'boy-cap'
    this.#role = role || 'นิสิต'
    this.#faculty = faculty || '-'
  }

  get deviceId() {
    return this.#deviceId
  }

  set deviceId(value) {
    this.#deviceId = value
  }

  get nickname() {
    return this.#nickname
  }

  set nickname(value) {
    this.#nickname = value
  }

  get avatarId() {
    return this.#avatarId
  }

  set avatarId(value) {
    this.#avatarId = value
  }

  get role() {
    return this.#role
  }

  set role(value) {
    this.#role = value
  }

  get faculty() {
    return this.#faculty
  }

  set faculty(value) {
    this.#faculty = value
  }
}

export class Queue {
  #id
  #status
  #assignedCourt
  #createdAt
  #playerCount
  #order
  #players

  constructor({
    queue_id,
    status,
    assigned_court,
    created_at,
    player_count,
    queue_order,
    players = []
  }) {
    this.#id = queue_id
    this.#status = status
    this.#assignedCourt = assigned_court
    this.#createdAt = new Date(created_at)
    this.#playerCount = Number(player_count) || 0
    this.#order = queue_order ? Number(queue_order) : null
    this.#players = players.map(p => new QueuePlayer(p))
  }

  get id() {
    return this.#id
  }

  set id(value) {
    this.#id = value
  }

  get status() {
    return this.#status
  }

  set status(value) {
    this.#status = value
  }

  get assignedCourt() {
    return this.#assignedCourt
  }

  set assignedCourt(value) {
    this.#assignedCourt = value
  }

  get createdAt() {
    return this.#createdAt
  }

  set createdAt(value) {
    this.#createdAt = value instanceof Date ? value : new Date(value)
  }

  get playerCount() {
    return this.#playerCount
  }

  set playerCount(value) {
    this.#playerCount = Number(value) || 0
  }

  get order() {
    return this.#order
  }

  set order(value) {
    this.#order = value ? Number(value) : null
  }

  get players() {
    return this.#players
  }

  set players(value) {
    this.#players = (value || []).map(p => (p instanceof QueuePlayer ? p : new QueuePlayer(p)))
  }

  // Domain Logic / Getters
  // เรียกได้เฉพาะเมื่อสมาชิกครบ 4 คน (ทั้ง WAITING และ SKIPPED ต้องครบ 4)
  get isReadyToPlay() {
    return this.#players.length >= 4 && (this.#status === 'SKIPPED' || this.#status === 'WAITING')
  }

  get isFull() {
    return this.#players.length >= 4
  }

  get availableSlots() {
    return Math.max(0, 4 - this.#players.length)
  }

  get displayOrder() {
    if (this.#order !== null) return `#${this.#order}`
    if (this.#status === 'ON_HOLD') return 'พักคิว'
    return `${this.#players.length}/4`
  }
}