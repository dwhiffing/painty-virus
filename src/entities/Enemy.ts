import { x, y, h, w } from '../constants'

export class Enemy extends Phaser.GameObjects.Sprite {
  moveTimer: number
  _angle: number
  health: number
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'icon')
    this.setDepth(20)
    this.moveTimer = 999
    this.health = 5
    scene.physics.add.existing(this)

    this.scene.time.addEvent({
      callback: () => {
        this.moveTimer--

        if (this.moveTimer <= 0) {
          this.moveTimer = 10
          this.move()
        }
      },
      delay: 20,
      repeat: -1,
    })
  }

  reset() {
    this.health = 5
    this._angle = Phaser.Math.RND.rotation()
    this.moveTimer = Phaser.Math.RND.between(8, 12)
    this.setVisible(true)
    this.setActive(true)
  }

  damage(amount: number) {
    this.health -= amount

    if (this.health <= 0) {
      this.setActive(false).setVisible(false)
    }
  }

  move() {
    this.y += Math.cos(this._angle) * 1
    this.x += Math.sin(this._angle) * 1

    if (
      this.x < x + 30 ||
      this.x > w + 20 ||
      this.y < y + 16 ||
      this.y > h + 8
    ) {
      this.scene.scene.restart()
      this.setActive(false)
      this.setVisible(false)
    }
  }
}
