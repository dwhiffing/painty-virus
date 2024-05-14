import { getInBounds, ENEMY_TYPES } from '../constants'
import { Game } from '../scenes/Game'

export class Enemy extends Phaser.GameObjects.Sprite {
  moveTimer: number
  _angle: number
  health: number
  maxHealth: number
  speed: number
  color: number
  dying: boolean
  stunned: boolean
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
    this.setMask(this._scene.antivirus.mask)

    this.scene.time.addEvent({
      callback: () => {
        if (this.dying || !this.active || this.stunned) return
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
    this.maxHealth = enemyType.health
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
    if (this.health <= 0) return
    this.health -= amount

    this.scene.sound.play('enemy-hit', {
      rate: 1.5 + Phaser.Math.RND.frac() * 2,
      volume: 0.1 + Phaser.Math.RND.frac() / 4,
    })

    if (!this.stunned) {
      this.setTintFill(0x999999)
      this.stunned = true
      this.scene.time.delayedCall(150 + amount * 150, () => {
        this.setTintFill(this.color)
        this.stunned = false
      })
    }

    if (this.health <= 0 && !this.dying) {
      this.dying = true
      this.setTintFill(0x000000)
      this.play('explode')

      if (this.maxHealth === ENEMY_TYPES[3].health) {
        this.scene.sound.play('boss-dead', {
          volume: 0.4 + Phaser.Math.RND.frac() / 4,
          rate: 0.5 + Phaser.Math.RND.frac(),
        })
      } else {
        this.scene.sound.play('enemy-dead', {
          volume: 0.4 + Phaser.Math.RND.frac() / 4,
          rate: 0.5 + Phaser.Math.RND.frac(),
        })
      }
      this.scene.time.delayedCall(500, () => {
        this.setActive(false).setVisible(false)
        this._scene.antivirus.checkNextWave()
      })
    }
  }

  move() {
    if (this.dying || !this.active) return

    this.y += Math.cos(this._angle) * 1
    this.x += Math.sin(this._angle) * 1

    if (!getInBounds(this.getCenter())) {
      this.setActive(false).setVisible(false)
      this.dying = true
      this._scene.loseLife()
    }
  }
}
