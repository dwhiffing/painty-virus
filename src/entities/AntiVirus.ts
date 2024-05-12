import { LEVELS, x, y, w, h } from '../constants'
import { Game } from '../scenes/Game'

import { Bullet } from './Bullet'
import { Enemy } from './Enemy'
import { PaintUI } from './PaintUI'

export class AntiVirus {
  scene: Game
  enemies: Phaser.GameObjects.Group
  bullets: Phaser.GameObjects.Group
  constructor(scene: Game) {
    this.scene = scene

    new PaintUI(this.scene, x, y, w, h)
    this.enemies = this.scene.add.group({ classType: Enemy, maxSize: 8 })

    this.bullets = this.scene.add.group({
      classType: Bullet,
      maxSize: 50,
      runChildUpdate: true,
    })

    this.scene.time.addEvent({
      delay: 200,
      repeat: -1,
      callback: () => {
        const p = this.scene.input.activePointer
        const closest = this.getClosestEnemyToCursor()
        const bullet = this.bullets.get(p.x, p.y) as Bullet
        bullet?.moveToward(closest?.getCenter())
      },
    })

    this.nextWave()
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
      this.scene.time.delayedCall(4000, () => {
        this.scene.scene.restart()
      })
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
    this.nextWave()
  }

  update() {
    this.scene.physics.overlap(this.enemies, this.bullets, (_a, _b) => {
      const a = _a as Enemy
      const b = _b as Bullet
      if (!a.active || !b.active) return
      a.damage(1)
      b.setActive(false).setVisible(false)
    })
  }
}
