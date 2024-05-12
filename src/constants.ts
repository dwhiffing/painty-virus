export const x = 50
export const y = 10
export const w = 221
export const h = 180

export const ENEMY_TYPES = [
  { type: 'base', frame: 2, health: 5, speed: 5, size: 4 },
  { type: 'tough', frame: 0, health: 20, speed: -20, size: 4 },
  { type: 'quick', frame: 3, health: 5, speed: 8, size: 4 },
  { type: 'boss', frame: 6, health: 5, speed: -50, size: 4 },
  // TODO: implement thief behaviour
  { type: 'thief', frame: 4, health: 5, speed: 4, size: 4 },
  // TODO: implement spawning behaviour
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
      enemies: [e(3, 3)],
    },
  ],
]

export interface Weapon {
  maxAmmo: number // max number of bullets stored, -1 means infinite
  ammo: number // current number of bullets stored, -1 means infinite
  health: number // current number of bullets stored, -1 means infinite
  lifetime: number // current number of bullets stored, -1 means infinite
  speed: number // min time between firing bullets
  fireTiming: number // min time between firing bullets
  fireRate: number // min time between firing bullets
  reloadRate: number // how many weapon ticks does it take to get another bullet?
  reloadTiming: number // current number of ticks til next bullet
  bulletSize: number
  bodySize?: number
  explodeDamage?: number
  shootTime?: number
  isTower?: boolean
  explodeRadius: number
  damage: number
  setupTime: number
}

export const INITIAL_WEAPONS = [
  // pencil
  {
    maxAmmo: 9,
    ammo: 9,
    reloadRate: 15,
    reloadTiming: 15,
    fireRate: 2,
    speed: 50,
    fireTiming: 0,
    health: 1,
    lifetime: 100,
    bulletSize: 2,
    damage: 1,
    explodeRadius: 0,
    setupTime: 0,
  },

  // eraser
  {
    maxAmmo: 3,
    ammo: 3,
    reloadRate: 100,
    reloadTiming: 100,
    fireRate: 20,
    speed: 200,
    fireTiming: 0,
    lifetime: 100,
    health: 100,
    bulletSize: 10,
    damage: 50,
    explodeRadius: 0,
    setupTime: 0,
  },

  // line
  {
    maxAmmo: 9,
    ammo: 9,
    reloadRate: 50,
    reloadTiming: 50,
    fireRate: 2,
    speed: 10,
    fireTiming: 0,
    lifetime: 30,
    health: 10,
    bulletSize: 3,
    damage: 0,
    explodeDamage: 10,
    explodeRadius: 10,
    setupTime: 0,
  },

  // brush
  {
    maxAmmo: 5,
    ammo: 5,
    reloadRate: 100,
    reloadTiming: 100,
    fireRate: 10,
    speed: 0,
    fireTiming: 0,
    lifetime: -1,
    health: 0,
    bodySize: 20,
    bulletSize: 8,
    damage: 50,
    explodeRadius: 50,
    setupTime: 300,
  },

  // spray
  {
    maxAmmo: 1,
    ammo: 1,
    reloadRate: 200,
    reloadTiming: 200,
    fireRate: 10,
    speed: 0,
    fireTiming: 0,
    lifetime: -1,
    health: 0,
    bodySize: 60,
    bulletSize: 5,
    damage: 0,
    explodeRadius: 0,
    setupTime: 50,
    shootTime: 40,
    isTower: true,
  },

  // bucket
  {
    maxAmmo: 1,
    ammo: 1,
    reloadRate: 500,
    reloadTiming: 500,
    fireRate: 20,
    speed: 0,
    fireTiming: 0,
    lifetime: 0,
    health: 0,
    bulletSize: 10,
    damage: 999,
    explodeRadius: 9999,
    setupTime: 0,
  },
]

export const getInBounds = (p: Phaser.Math.Vector2) =>
  !(p.x < x + 30 || p.x > w + 20 || p.y < y + 16 || p.y > h + 8)
