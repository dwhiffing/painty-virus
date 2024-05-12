import {
  LEVELS,
  x,
  y,
  w,
  h,
  Weapon,
  INITIAL_WEAPONS,
  getInBounds,
} from '../constants'
import { Game } from '../scenes/Game'

import { Bullet } from './Bullet'
import { Enemy } from './Enemy'
import { PaintUI } from './PaintUI'

export class AntiVirus {
  scene: Game
  enemies: Phaser.GameObjects.Group
  bullets: Phaser.GameObjects.Group
  weapons: Weapon[]
  constructor(scene: Game) {
    this.scene = scene

    new PaintUI(this.scene, x, y, w, h)
    this.enemies = this.scene.add.group({ classType: Enemy, maxSize: 8 })

    this.bullets = this.scene.add.group({
      classType: Bullet,
      maxSize: 50,
      runChildUpdate: true,
    })

    this.weapons = INITIAL_WEAPONS.map((w) => ({ ...w }))

    this.setupWeapons()

    this.scene.tacky.say(`Level 1`).then(() => {
      this.nextWave()
    })
  }

  setupWeapons() {
    this.scene.data.set('toolIndex', 0)
    this.scene.data.set('foregroundColor', 0)
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!getInBounds(p.position)) return
      const activeWeapon = this.weapons[this.scene.data.get('toolIndex')]

      if (!activeWeapon || activeWeapon.ammo <= 0) return

      if (this.scene.data.get('toolIndex') === 0) {
        const p = this.scene.input.activePointer
        activeWeapon.ammo--
        this.scene.events.emit('updateammo')
        const closest = this.getClosestEnemyToCursor()
        const bullet = this.bullets.get(p.x, p.y) as Bullet

        bullet?.moveToward(closest?.getCenter(), activeWeapon.damage)
      }
    })

    this.scene.time.addEvent({
      delay: 200,
      repeat: -1,
      callback: () => {
        const activeWeapon = this.weapons[this.scene.data.get('toolIndex')]

        if (activeWeapon.ammo < activeWeapon.maxAmmo) {
          if (activeWeapon.reloadTiming > 0) {
            activeWeapon.reloadTiming--
          } else {
            activeWeapon.ammo++
            activeWeapon.reloadTiming = activeWeapon.reloadRate
          }
        }
        this.scene.events.emit('updateammo')
      },
    })
  }

  getEnemies() {
    return this.enemies.getChildren() as Enemy[]
  }

  getClosestEnemyToCursor() {
    const p = this.scene.input.activePointer
    return this.getEnemies()
      .filter((c) => c.health > 0)
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
      this.scene.data.inc('wave')
      this.nextWave()
    }
  }

  get wave() {
    const level = LEVELS[this.scene.data.get('level')]
    return level?.[this.scene.data.get('wave')]
  }

  nextWave() {
    this.scene.data.set('enemyIndex', 0)
    const level = LEVELS[this.scene.data.get('level')]
    if (!level) {
      this.scene.tacky.say('You win')
      // TODO: what happens when you win?
      // this.scene.time.delayedCall(4000, () => {
      //   this.scene.scene.restart()
      // })
      return
    }
    if (!this.wave) {
      this.nextLevel()
      return
    }

    const nextEnemy = () => {
      const enemy = this.wave?.enemies[this.scene.data.get('enemyIndex')]
      if (enemy) {
        this.scene.data.inc('enemyIndex')
        this.enemies.get(160, 100)?.reset(enemy.type, enemy.color)
      }
    }

    nextEnemy()
    if (this.wave.enemies.length > 1)
      this.scene.time.addEvent({
        delay: this.wave.speed,
        repeat: this.wave.enemies.length - 1,
        callback: nextEnemy,
      })
  }

  nextLevel() {
    this.scene.data.inc('level')
    this.scene.data.set('wave', 0)

    const level = LEVELS[this.scene.data.get('level')]
    if (level)
      this.scene.tacky
        .say(`Level ${this.scene.data.get('level') + 1}`)
        .then(() => {
          this.nextWave()
        })
  }

  update() {
    if (!this.enemies.children || !this.bullets.children) return
    this.scene.physics.overlap(this.enemies, this.bullets, (_a, _b) => {
      const a = _a as Enemy
      const b = _b as Bullet
      if (!a.active || !b.active) return
      a.damage(b.damage)
      b.setActive(false).setVisible(false)
    })
  }
}
