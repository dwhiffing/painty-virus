import { Scene } from 'phaser'
import { Paint } from '../entities/Paint'
import { Icon } from '../entities/Icon'
import { Enemy } from '../entities/Enemy'
import { Bullet } from '../entities/Bullet'
import { Canvas } from '../entities/Canvas'
import { x, y, w, h, LEVELS } from '../constants'

export class Game extends Scene {
  enemies: Phaser.GameObjects.Group
  bullets: Phaser.GameObjects.Group
  text: Phaser.GameObjects.BitmapText
  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setRoundPixels(false)
    this.text = this.add.bitmapText(260, 180, 'clarity', 'Welcome', 8)

    new Paint(this, x, y, w, h)
    new Canvas(this, x, y, w, h)
    new Icon(this, 5, 5, () => {})

    this.bullets = this.add.group({
      classType: Bullet,
      maxSize: 200,
      runChildUpdate: true,
    })

    this.time.addEvent({
      delay: 200,
      repeat: -1,
      callback: () => {
        const p = this.input.activePointer

        const children =
          this.enemies.getChildren() as Phaser.GameObjects.Sprite[]
        const closest = children
          .filter((c) => c.active && c.visible)
          .sort((a, b) => {
            const distA = Phaser.Math.Distance.BetweenPoints(a.getCenter(), p)
            const distB = Phaser.Math.Distance.BetweenPoints(b.getCenter(), p)

            return distA - distB
          })?.[0]

        if (!closest) return

        const bullet = this.bullets.get(p.x, p.y)

        if (bullet && bullet.body && closest) {
          const body = bullet.body
          bullet.setVisible(true).setActive(true)
          const ang = Phaser.Math.Angle.BetweenPoints(p, closest.getCenter())
          body.velocity.x = Math.cos(ang) * 100
          body.velocity.y = Math.sin(ang) * 100
        }
      },
    })

    this.enemies = this.add.group({
      classType: Enemy,
      maxSize: 8,
    })

    this.data.set('wave', 0)
    this.data.set('level', 0)
    this.nextWave()
  }

  checkNextWave() {
    const livingEnemies = this.enemies
      .getChildren()
      .filter((e) => e.active).length
    if (livingEnemies === 0) {
      this.data.inc('wave')
      this.nextWave()
    }
  }
  nextWave() {
    let i = 0
    const level = LEVELS[this.data.get('level')]
    if (!level) {
      this.text.text = 'You win'
      this.time.delayedCall(4000, () => {
        this.scene.restart()
      })
      return
    }
    const wave = level[this.data.get('wave')]
    if (!wave) {
      this.nextLevel()
      return
    }

    this.time.addEvent({
      delay: 500,
      repeat: wave.enemies.length - 1,
      callback: () => {
        const enemyType = wave.enemies[i++]
        // TODO: more enemy types
        this.enemies.get(160, 100)?.reset()
      },
    })
  }

  nextLevel() {
    this.data.inc('level')
    this.data.set('wave', 0)
    this.nextWave()
  }

  update() {
    this.physics.overlap(this.enemies, this.bullets, (_a, _b) => {
      const a = _a as Enemy
      const b = _b as Bullet
      if (!a.active || !b.active) return
      a.damage(1)
      b.setActive(false).setVisible(false)

      this.checkNextWave()
    })
  }
}
