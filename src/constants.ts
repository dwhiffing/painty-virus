export const x = 50
export const y = 10
export const w = 221
export const h = 180

export const ENEMY_TYPES = [
  { type: 'base', frame: 2, health: 5, speed: 4, size: 4 },
  { type: 'tough', frame: 0, health: 30, speed: 0, size: 8 },
  { type: 'quick', frame: 3, health: 1, speed: 9, size: 4 },
  { type: 'boss', frame: 6, health: 100, speed: -10, size: 8 },
  // TODO: implement thief behaviour
  // { type: 'thief', frame: 4, health: 5, speed: 4, size: 4 },
  // TODO: implement cluster behaviour
  // { type: 'cluster', frame: 5, health: 5, speed: 2, size: 4 },
  // TODO: implement support behaviour
  // { type: 'support', frame: 1, health: 5, speed: 4, size: 4 },
]

export const PAINT_COLORS = [
  0x2a2a2a, 0xea3323, 0x4cd522, 0x0000f5, 0xefc821, 0xea33f7, 0x38dfe1,
]

const ENEMY_COLORS = [0x000000, 0xff0000, 0x00ff00, 0x0000ff]

const e = (type: number) => ({ type, color: ENEMY_COLORS[type] })

export const LEVELS = [
  // level 1
  [
    [0],
    [0, 0],
    [0, 0, 0],
    // end
  ],
  // level 2
  [
    [1],
    [0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    // end
  ],
  // level 3
  [
    [2],
    [0, 0, 2, 0, 0],
    [0, 1, 0, 0, 2, 0],
    [0, 0, 1, 1, 2, 0, 0],
    // end
  ],
  // level 4
  [
    [1, 0, 1, 0, 2, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 2, 0, 2],
    [0, 0, 2, 0, 0, 2],
    [1, 1, 1, 1],
    // end
  ],
  // level 5
  [
    [3],
    [0, 0, 2, 2, 0, 0, 1, 1, 1],
    [2, 0, 0, 3, 0, 0, 2, 0, 2, 0],
    [1, 0, 1, 0, 3, 2, 0, 2, 0, 2, 3],
    [0, 0, 2, 3, 2, 0, 2, 0, 1, 3, 1],
    [3, 3, 3, 1, 1, 1, 2, 0, 0, 2, 0, 0, 2, 2],
    // end
  ],
].map((l) => l.map((w) => ({ enemies: w.map(e) })))

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
  isFromTower?: boolean
  isTower?: boolean
  isBucket?: boolean
  isEraser?: boolean
  isMine?: boolean
  particleCount?: number
  particleSpeed?: number
  particleLifespan?: number
  stainSize?: number
  explodeRadius: number
  damage: number
  setupTime: number
}

export const INITIAL_WEAPONS = [
  // pencil
  {
    maxAmmo: 9,
    ammo: 9,
    reloadRate: 10,
    reloadTiming: 10,
    fireRate: 4,
    speed: 50,
    fireTiming: 0,
    health: 1,
    lifetime: 100,
    bulletSize: 2,
    damage: 1,
    particleCount: 4,
    stainSize: 2,
    particleSpeed: 20,
    explodeRadius: 0,
    setupTime: 0,
  },

  // eraser
  {
    maxAmmo: 3,
    ammo: 3,
    reloadRate: 200,
    reloadTiming: 200,
    fireRate: 20,
    speed: 200,
    fireTiming: 0,
    lifetime: 100,
    health: 100,
    bulletSize: 10,
    damage: 10,
    particleCount: 14,
    stainSize: 10,
    particleSpeed: 20,
    particleLifespan: 500,
    isEraser: true,
    explodeRadius: 0,
    setupTime: 0,
  },

  // line
  {
    maxAmmo: 6,
    ammo: 6,
    reloadRate: 70,
    reloadTiming: 70,
    fireRate: 2,
    speed: 10,
    fireTiming: 0,
    lifetime: 48,
    health: 10,
    bulletSize: 3,
    damage: 0,
    particleCount: 20,
    stainSize: 0,
    particleSpeed: 50,
    explodeDamage: 10,
    explodeRadius: 10,
    setupTime: 0,
  },

  // brush
  {
    maxAmmo: 3,
    ammo: 3,
    reloadRate: 130,
    reloadTiming: 130,
    fireRate: 10,
    speed: 0,
    fireTiming: 0,
    lifetime: -1,
    health: 0,
    isMine: true,
    bodySize: 32,
    bulletSize: 0,
    damage: 1,
    explodeDamage: 30,
    explodeRadius: 50,
    setupTime: 250,
  },

  // spray
  {
    maxAmmo: 2,
    ammo: 2,
    reloadRate: 320,
    reloadTiming: 320,
    fireRate: 15,
    speed: 0,
    fireTiming: 0,
    lifetime: 900,
    health: 0,
    bodySize: 70,
    bulletSize: 0,
    damage: 0,
    explodeRadius: 0,
    setupTime: 0,
    shootTime: 15,
    isTower: true,
  },

  // bucket
  {
    maxAmmo: 1,
    ammo: 1,
    reloadRate: 800,
    reloadTiming: 800,
    fireRate: 20,
    speed: 0,
    fireTiming: 0,
    lifetime: 0,
    health: 0,
    bulletSize: 1,
    damage: 50,
    explodeRadius: 9999,
    particleLifespan: 1500,
    setupTime: 0,
    isBucket: true,
  },
]

export const getInBounds = (p: Phaser.Math.Vector2) =>
  !(p.x < x + 30 || p.x > w + 20 || p.y < y + 16 || p.y > h + 8)

export const CURSOR_ORIGINS = [
  [0.3, 1],
  [0.1, 0.8],
  [0.1, 0.1],
  [0.5, 1],
  [0.3, 0.3],
  [0.2, 0.9],
  [0.2, 0.1],
]

export const PAINT_WINDOW_DEPTH = 10
export const BULLET_DEPTH = 19
export const ENEMY_DEPTH = 20
export const ABOUT_ALERT_DEPTH = 30
export const VIRUS_ALERT_DEPTH = 40
export const TACKY_DEPTH = 60
export const CURSOR_DEPTH = 70
