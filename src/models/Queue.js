export class QueuePlayer {
  constructor({ device_id, nickname, avatar_id, role, faculty }) {
    this.deviceId = device_id
    this.nickname = nickname || 'ไม่ระบุชื่อ'
    this.avatarId = avatar_id || 'boy-cap'
    this.role = role || 'นิสิต'
    this.faculty = faculty || '-'
  }
}

export class Queue {
  constructor({
    queue_id,
    status,
    assigned_court,
    created_at,
    player_count,
    queue_order,
    players = []
  }) {
    this.id = queue_id
    this.status = status
    this.assignedCourt = assigned_court
    this.createdAt = new Date(created_at)
    this.playerCount = Number(player_count) || 0
    this.order = queue_order ? Number(queue_order) : null
    this.players = players.map(p => new QueuePlayer(p))
  }

  // Domain Logic / Getters
  // เรียกได้เฉพาะเมื่อสมาชิกครบ 4 คน (ทั้ง WAITING และ SKIPPED ต้องครบ 4)
  get isReadyToPlay() {
    return this.players.length >= 4 && (this.status === 'SKIPPED' || this.status === 'WAITING')
  }

  get isFull() {
    return this.players.length >= 4
  }

  get availableSlots() {
    return Math.max(0, 4 - this.players.length)
  }

  get displayOrder() {
    if (this.order !== null) return `#${this.order}`
    if (this.status === 'ON_HOLD') return 'พักคิว'
    return `${this.players.length}/4`
  }
}