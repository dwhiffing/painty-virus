import { x, y, h, w, ENEMY_TYPES } from '../constants'
import { Game } from '../scenes/Game'

export class Enemy extends Phaser.GameObjects.Sprite {
  moveTimer: number
  _angle: number
  health: number
  speed: number
  color: number
  dying: boolean
  _scene: Game
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, 'enemies')
    this._scene = scene
    this.setDepth(20)
    this.moveTimer = 999
    this.health = 5
    this.color = 0xff0000
    this.dying = false
    scene.physics.add.existing(this)

    this.scene.time.addEvent({
      callback: () => {
        if (this.dying) return
        this.moveTimer--

        if (this.moveTimer <= 0) {
          this.moveTimer = 10 - this.speed
          this.move()
        }
      },
      delay: 20,
      repeat: -1,
    })
  }

  get _body() {
    return this.body as Phaser.Physics.Arcade.Body
  }

  reset(type = 0, color = 0x00ff00) {
    const enemyType = ENEMY_TYPES[type]
    this.health = enemyType.health
    this.color = color
    this.speed = enemyType.speed
    this.setTintFill(this.color)
    this.play(`enemy${enemyType.frame}`)
    this._angle = Phaser.Math.RND.rotation()
    this.moveTimer = 10 - this.speed
    this.dying = false
    this.setVisible(true)
    this.setActive(true)
    this._body.setSize(enemyType.size, enemyType.size)
  }

  damage(amount: number) {
    this.health -= amount

    if (this.health <= 0 && !this.dying) {
      this.dying = true
      this.play('explode')
      this.scene.time.delayedCall(500, () => {
        this.setActive(false).setVisible(false)
        this._scene.antivirus.checkNextWave()
      })
    }
  }

  move() {
    if (this.dying) return

    this.y += Math.cos(this._angle) * 1
    this.x += Math.sin(this._angle) * 1

    if (
      this.x < x + 30 ||
      this.x > w + 20 ||
      this.y < y + 16 ||
      this.y > h + 8
    ) {
      this.scene.scene.restart()
      this.setActive(false).setVisible(false)
    }
  }
}
