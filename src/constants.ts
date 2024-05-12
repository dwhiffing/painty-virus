export const x = 50
export const y = 10
export const w = 221
export const h = 180

export const ENEMY_TYPES = [
  { type: 'base', frame: 2, health: 5, speed: 5, size: 4 },
  { type: 'tough', frame: 0, health: 20, speed: -20, size: 4 },
  { type: 'quick', frame: 4, health: 5, speed: 8, size: 4 },
  // TODO: implement thief behaviour
  { type: 'thief', frame: 3, health: 5, speed: 4, size: 4 },
  // TODO: implement spawning behaviour
  { type: 'boss', frame: 6, health: 5, speed: -50, size: 4 },
  // TODO: implement cluster behaviour
  { type: 'cluster', frame: 5, health: 5, speed: 2, size: 4 },
  // TODO: implement support behaviour
  { type: 'support', frame: 1, health: 5, speed: 4, size: 4 },
]

const COLORS = [0x000000, 0xff0000, 0x00ff00, 0x0000ff]

const e = (type: number, color: number) => ({
  type,
  color: COLORS[color],
})

export const LEVELS = [
  [{ speed: 1500, enemies: [e(0, 0)] }],
  [
    {
      speed: 1500,
      enemies: [e(0, 0), e(0, 0), e(0, 0), e(1, 1), e(2, 2)],
    },
  ],
  [
    {
      speed: 1500,
      enemies: [e(3, 3), e(4, 0), e(5, 0), e(6, 0)],
    },
  ],
]

export interface Weapon {
  maxAmmo: number // max number of bullets stored, -1 means infinite
  ammo: number // current number of bullets stored, -1 means infinite
  fireRate: number // min time between firing bullets
  reloadRate: number // how many weapon ticks does it take to get another bullet?
  reloadTiming: number // current number of ticks til next bullet
  damage: number
}

export const INITIAL_WEAPONS = [
  {
    maxAmmo: 3,
    ammo: 3,
    reloadRate: 10,
    reloadTiming: 10,
    fireRate: 10,
    damage: 1,
  },
  {
    maxAmmo: 3,
    ammo: 3,
    reloadRate: 10,
    reloadTiming: 0,
    fireRate: 10,
    damage: 50,
  },
]

export const getInBounds = (p: Phaser.Math.Vector2) =>
  !(p.x < x + 30 || p.x > w + 20 || p.y < y + 16 || p.y > h + 8)
