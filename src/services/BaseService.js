// src/services/BaseService.js
import { supabase } from '../supabase'

// Base Service (abstract-ish) — รากของ service ทั้งหมด
// OOP:
//   - Encapsulation : #client เป็น private field เข้าถึงผ่าน getter/setter
//   - Polymorphism  : getTableName() ให้ subclass แต่ละตัว override คืนชื่อตารางของตัวเอง
//   - Inheritance   : UserService / QueueService ต่อ extends มาที่นี่
export class BaseService {
  #client

  constructor(client = supabase) {
    this.#client = client
  }

  get client() {
    return this.#client
  }

  set client(value) {
    this.#client = value
  }

  getTableName() {
    throw new Error('ต้อง override getTableName() ใน subclass')
  }
}