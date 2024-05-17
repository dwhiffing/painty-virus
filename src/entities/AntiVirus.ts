import {
  LEVELS,
  x,
  y,
  w,
  h,
  Weapon,
  INITIAL_WEAPONS,
  getInBounds,
  BULLET_DEPTH,
  PAINT_COLORS,
} from '../constants'
import { Game } from '../scenes/Game'

import { Bullet } from './Bullet'
import { Enemy } from './Enemy'
import { PaintUI } from './PaintUI'

export class AntiVirus {
  scene: Game
  enemies: Phaser.GameObjects.Group
  mask: Phaser.Display.Masks.GeometryMask
  bullets: Phaser.GameObjects.Group
  weapons: Weapon[]
  constructor(scene: Game) {
    this.scene = scene

    new PaintUI(this.scene, x, y, w, h)
    this.enemies = this.scene.add.group({ classType: Enemy, maxSize: 8 })
    this.scene.data.set('linedist', 0)
    const maskRect = this.scene.add
      .rectangle(x + 29, y + 16, w - 59, h - 18, 0x000000)
      .setOrigin(0)
      .setVisible(false)

    this.mask = maskRect.createGeometryMask()

    this.bullets = this.scene.add.group({
      classType: Bullet,
      maxSize: 250,
      runChildUpdate: true,
    })

    this.weapons = INITIAL_WEAPONS.map((w) => ({ ...w }))

    this.setupWeapons()
    this.startGame()
  }

  async startGame() {
    if (!this.scene.data.get('showfullintro')) {
      await this.scene.tacky.say("Let's get right to it then!")
    }

    await this.scene.tacky.say(`Level ${this.scene.data.get('level') + 1}`)

    this.nextWave()
  }

  shootActiveWeapon() {
    const p = this.scene.input.activePointer
    const toolIndex = this.scene.data.get('toolIndex')
    const activeWeapon = this.weapons[toolIndex]

    if (toolIndex === 2 && activeWeapon.ammo > 0) {
      this.scene.data.set('linestart', { ...p.position })
    }

    const distanceToCenter = Phaser.Math.Distance.Between(160, 100, p.x, p.y)
    if (
      activeWeapon.ammo <= 0 ||
      activeWeapon.fireTiming > 0 ||
      toolIndex === 2 ||
      ((toolIndex === 3 || toolIndex === 4) && distanceToCenter < 30)
    ) {
      const closeToCenter =
        (toolIndex === 3 || toolIndex === 4) && distanceToCenter < 30
      if (toolIndex !== 0 && (closeToCenter || activeWeapon.ammo <= 0)) {
        this.scene.sound.play('disabled', {
          rate: 2 + Phaser.Math.RND.frac() / 4,
        })
      }
      if (closeToCenter) {
        this.scene.tacky.say('too close to center!')
      }
      return
    }
    activeWeapon.ammo--
    activeWeapon.fireTiming = activeWeapon.fireRate
    const closest = this.getClosestEnemyToCursor()
    const bullet = this.bullets.get(p.x, p.y) as Bullet

    bullet?.moveToward(
      closest?.getCenter() ?? {
        x: Phaser.Math.RND.between(x, w),
        y: Phaser.Math.RND.between(y, h),
      },
      activeWeapon,
    )

    if (bullet) {
      if (toolIndex === 0) {
        this.scene.sound.play('mouse-click', {
          rate: 0.1 + Phaser.Math.RND.frac() / 2,
        })
      } else if (toolIndex === 1) {
        this.scene.sound.play('shoot-eraser', {
          rate: 0.7 + Phaser.Math.RND.frac() / 2,
        })
      } else if (toolIndex === 3 || toolIndex === 4) {
        this.scene.sound.play('mine-place', {
          rate: 0.7 + Phaser.Math.RND.frac() / 2,
        })
      } else if (toolIndex === 5) {
        this.scene.sound.play('shoot-bucket', {
          rate: 0.7 + Phaser.Math.RND.frac() / 2,
        })
      }
    }

    this.scene.events.emit('updateammo')
  }

  setupWeapons() {
    const lineGraphics = this.scene.add.graphics().setDepth(BULLET_DEPTH)
    lineGraphics.lineStyle(1, this.scene.data.get('foregroundColor'))

    this.scene.data.set('toolIndex', 0)
    this.scene.data.set(
      'foregroundColor',
      PAINT_COLORS[Phaser.Math.RND.between(0, PAINT_COLORS.length - 1)],
    )
    this.scene.input.on('pointerup', () => {
      const toolIndex = this.scene.data.get('toolIndex')
      const start = this.scene.data.get('linestart')
      lineGraphics.clear()
      if (!start || toolIndex !== 2 || this.scene.data.get('linedist') < 5) {
        this.scene.data.set('linestart', undefined)

        return
      }

      const activeWeapon = this.weapons[toolIndex]

      if (activeWeapon.ammo <= 0 || activeWeapon.fireTiming > 0) return

      activeWeapon.ammo--
      activeWeapon.fireTiming = activeWeapon.fireRate
      const bullet = this.bullets.get(start.x, start.y) as Bullet

      const damageFactor = Math.floor(this.scene.data.get('linedist') / 15 + 1)
      activeWeapon.speed = this.scene.data.get('linedist') * 5
      activeWeapon.explodeRadius = this.scene.data.get('linedist') + 6
      activeWeapon.explodeDamage = 10 * damageFactor

      bullet?.moveToward(this.scene.data.get('lineangle'), activeWeapon)
      if (bullet) {
        this.scene.sound.play('shoot-line', { volume: 0.7, rate: 0.4 })
      }

      this.scene.events.emit('updateammo')
      this.scene.data.set('linestart', undefined)
    })

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const toolIndex = this.scene.data.get('toolIndex')
      const start = this.scene.data.get('linestart')
      if (!getInBounds(p.position) || toolIndex !== 2 || !start) return

      const angle = Phaser.Math.Angle.BetweenPoints(start, p)
      let dist = Math.min(Phaser.Math.Distance.BetweenPoints(start, p), 30)
      if (dist < 3) dist = 0

      this.scene.data.set(
        'lineangle',
        Phaser.Math.Angle.BetweenPoints(p, start),
      )
      this.scene.data.set('linedist', dist)
      const f = {
        x: start.x + dist * Math.cos(angle),
        y: start.y + dist * Math.sin(angle),
      }

      lineGraphics.clear()
      lineGraphics.lineStyle(1, this.scene.data.get('foregroundColor'))
      lineGraphics.moveTo(start.x, start.y)
      lineGraphics.lineTo(f.x, f.y)
      lineGraphics.stroke()
    })

    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!getInBounds(p.position)) return

      this.shootActiveWeapon()
    })

    this.scene.time.addEvent({
      delay: 50,
      repeat: -1,
      callback: () => {
        this.weapons.forEach((w) => {
          if (w.fireTiming > 0) {
            w.fireTiming--
          }

          if (w.ammo < w.maxAmmo) {
            if (w.reloadTiming > 1) {
              w.reloadTiming--
            } else {
              w.ammo++
              w.reloadTiming = w.reloadRate
            }
          }
        })

        this.scene.events.emit('updateammo')
      },
    })
  }

  getEnemies() {
    return this.enemies.getChildren() as Enemy[]
  }

  getClosestEnemyToCursor() {
    const p = this.scene.input.activePointer
    return this.getClosestEnemyTo(p)
  }

  getClosestEnemyTo(p: { x: number; y: number }) {
    return this.getEnemies()
      .filter((c) => c.health > 0 && c.active)
      .sort((a, b) => {
        const distA = Phaser.Math.Distance.BetweenPoints(a.getCenter(), p)
        const distB = Phaser.Math.Distance.BetweenPoints(b.getCenter(), p)

        return distA - distB
      })?.[0]
  }

  checkNextWave() {
    const livingEnemies = this.enemies
      .getChildren()
      .filter((e) => e.active).length

    const remainingEnemies =
      this.wave.enemies.length - this.scene.data.get('enemyIndex')

    if (livingEnemies <= 0 && remainingEnemies <= 0) {
      this.scene.time.delayedCall(500, () => {
        this.scene.data.inc('wave')
        this.nextWave()
      })
    }
  }

  get wave() {
    const level = LEVELS[this.scene.data.get('level')]
    return level?.[this.scene.data.get('wave')]
  }

  nextWave() {
    if (!this.wave) {
      this.nextLevel()
      return
    }
    this.scene.data.set('enemyIndex', 0)

    const nextEnemy = () => {
      const enemy = this.wave?.enemies[this.scene.data.get('enemyIndex')]
      if (enemy) {
        this.scene.data.inc('enemyIndex')
        if (enemy.type === 0) {
          this.scene.sound.play('enemy-spawn', {
            rate: 1.5 + Phaser.Math.RND.frac() / 8,
          })
        } else if (enemy.type === 1) {
          this.scene.sound.play('enemy-spawn2', {
            rate: 0.2 + Phaser.Math.RND.frac() / 8,
          })
        } else if (enemy.type === 2) {
          this.scene.sound.play('enemy-spawn3', {
            rate: 0.5 + Phaser.Math.RND.frac() / 8,
          })
        } else if (enemy.type === 3) {
          this.scene.sound.play('boss-spawn', {
            volume: 0.3,
            rate: 0.9 + Phaser.Math.RND.frac() / 8,
          })
        }
        this.enemies.get(160, 100)?.reset(enemy.type, enemy.color)
      }
    }

    nextEnemy()
    if (this.wave.enemies.length > 1)
      this.scene.time.addEvent({
        delay: 3000 - 500 * this.scene.data.get('level'),
        repeat: this.wave.enemies.length - 1,
        callback: nextEnemy,
      })
  }

  nextLevel() {
    this.scene.data.inc('level')
    this.scene.data.set('wave', 0)

    this.scene.sound.play('next-level', { rate: 0.7 })

    const level = LEVELS[this.scene.data.get('level')]
    if (level)
      this.scene.tacky
        .say(`Level ${this.scene.data.get('level') + 1}`)
        .then(() => {
          this.nextWave()
        })

    if (!level) {
      this.scene.sound.play('startup')
      this.scene.tacky.say('You win', Infinity)
      return
    }
  }

  update() {
    if (
      this.scene.input.activePointer.isDown &&
      this.scene.data.get('toolIndex') === 0 &&
      getInBounds(this.scene.input.activePointer.position)
    ) {
      this.shootActiveWeapon()
    }
    if (!this.enemies.children || !this.bullets.children) return
    this.scene.physics.overlap(this.enemies, this.bullets, (_a, _b) => {
      const a = _a as Enemy
      const b = _b as Bullet

      if (!a.active || !b.active) return
      if (b.isTower && b.shootTime <= 0) {
        b.shootTime = b.maxShootTime
        const closest = this.getClosestEnemyTo(b)
        const bullet = this.bullets.get(b.x, b.y - 5) as Bullet

        bullet.setFillStyle(b.fillColor)
        this.scene.sound.play('mouse-click', {
          rate: 0.05 + Phaser.Math.RND.frac() / 4,
        })
        const activeWeapon = {
          ...INITIAL_WEAPONS[0],
          speed: 100,
          damage: 0.34,
          firerate: 1,
          lifetime: 40,
          bulletSize: 1,
          isFromTower: true,
        }
        bullet?.moveToward(
          closest?.getCenter() ?? {
            x: Phaser.Math.RND.between(x, w),
            y: Phaser.Math.RND.between(y, h),
          },
          activeWeapon,
        )
      }
      if (b.setupTime > 0 || b.damage === 0 || b.hitEnemies.includes(a)) return
      a.damage(b.damage)
      b.hitEnemies.push(a)
      b.takeDamage(1)
    })
  }
}
