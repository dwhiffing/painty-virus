import { getInBounds, ENEMY_TYPES, ENEMY_DEPTH } from '../constants'
import { Game, TIMESCALE } from '../scenes/Game'
import { Bullet } from './Bullet'

let frame = 0
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

    this.setDepth(ENEMY_DEPTH)
    this.moveTimer = 999
    this.health = 5
    this.color = 0xff0000
    this.dying = false
    scene.physics.add.existing(this)
    this.setMask(this._scene.antivirus.mask)

    this.scene.time.addEvent({
      callback: () => {
        if (this.dying || !this.active || this.stunned) return
        this.moveTimer -= TIMESCALE

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
    this.setAlpha(1)
    this.play(`enemy${enemyType.frame}`)
    this._angle = Phaser.Math.RND.rotation()
    this.moveTimer = 10 - this.speed
    this.dying = false
    this.stunned = false
    this.setVisible(true)
    this.setActive(true)
    this._body.setSize(enemyType.size, enemyType.size)
  }

  damage(bullet: Bullet) {
    if (this.health <= 0) return
    const damage = bullet.explodeDamage || bullet.damage
    this.health -= damage

    this.scene.sound.play('enemy-hit', {
      rate: 1.5 + Phaser.Math.RND.frac() * 2,
      volume: 0.1 + Phaser.Math.RND.frac() / 4,
    })

    if (!this.stunned) {
      this.setTintFill(bullet.fillColor)
      this.setAlpha(0.6)
      this.stunned = true
      this.scene.time.delayedCall(Math.min(500, 200 + damage * 30), () => {
        this.setTintFill(this.color)
        this.setAlpha(1)
        this.stunned = false
      })
    }

    if (this.health <= 0 && !this.dying) {
      this.dying = true
      this.color = bullet.fillColor
      this.setTintFill(this.color)
      this.setAlpha(1)
      this.play('explode')
      this.emitParticles()
      this.emitStain()

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

  emitParticles() {
    this._scene.antivirus.enemyParticles.setConfig({
      speedX: { min: -70, max: 70 },
      speedY: { min: -70, max: 70 },
      scale: this.maxHealth > 10 ? 2 : 1,
      alpha: { start: 1, end: 0 },
      lifespan: { min: 200, max: 1200 },
      tint: this.color,
    })
    this._scene.antivirus.enemyParticles.emitParticle(15, this.x, this.y)
  }

  emitStain() {
    const stainSize = 1
    const life = 15000
    frame++

    frame %= 4
    if (stainSize > 0) {
      const size = stainSize
      this._scene.antivirus.enemyStains.setConfig({
        speedX: 0,
        speedY: 0,
        scale: size,
        frame: frame,
        alpha: { start: 1, end: 0 },
        lifespan: {
          max: life * 1.1,
          min: life * 0.9,
        },
        tint: this.color,
      })
      this._scene.antivirus.enemyStains.emitParticle(1, this.x, this.y)
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
