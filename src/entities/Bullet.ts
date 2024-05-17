import { BULLET_DEPTH, Weapon, h, w, x, y } from '../constants'
import { Game, TIMESCALE } from '../scenes/Game'
import { Enemy } from './Enemy'

export class Bullet extends Phaser.GameObjects.Rectangle {
  _scene: Game
  moveTimer: number
  damage: number
  health: number
  lifetime: number
  speed: number
  isTower: boolean
  isMine: boolean
  shootTime: number
  isEraser: boolean
  isBucket: boolean
  particleCount: number
  stainSize: number
  particleSpeed: number
  particleLifespan: number
  maxShootTime: number
  explodeRadius: number
  explodeDamage: number
  hitEnemies: Enemy[]
  explodeTween: Phaser.Tweens.BaseTween
  explodeCircle: Phaser.GameObjects.Arc
  maxLifetime: number
  setupTime: number
  maxSetupTime: number
  image: Phaser.GameObjects.Sprite
  image2: Phaser.GameObjects.Sprite
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, 2, 2, scene.data.values.foregroundColor)
    this._scene = scene
    scene.physics.add.existing(this)

    this.setDepth(BULLET_DEPTH)

    this.setMask(this._scene.antivirus.mask)

    this.image = this.scene.add
      .sprite(x, y, 'spray')
      .setDepth(BULLET_DEPTH - 2)
      .setAlpha(0)
      .setMask(this._scene.antivirus.mask)

    this.image2 = this.scene.add
      .sprite(x, y, 'spray-top')
      .setDepth(BULLET_DEPTH - 2)
      .setAlpha(0)
      .setMask(this._scene.antivirus.mask)
    this.hitEnemies = []

    this.explodeCircle = this.scene.add
      .circle(10, 10, 10, 0x000000)
      .setAlpha(0)
      .setDepth(BULLET_DEPTH)
      .setMask(this._scene.antivirus.mask)
  }

  update() {
    if (this.maxLifetime > -1) {
      this.lifetime -= TIMESCALE
    }
    if (this.shootTime > -1) {
      this.shootTime -= TIMESCALE
    }

    if (this.visible && this.isEraser) this.emitStain()

    if (this.setupTime > 0) {
      this.setAlpha(0.5)
      this.setupTime -= TIMESCALE
    } else if (this.setupTime > -99) {
      if (this.isMine && this.active && this.visible) {
        this.setupTime = -99
        this.scene.sound.play('talk', { rate: 0.5 })
        this.image.setTexture('mine')
        this.image2.setAlpha(0)
      }
      this.setAlpha(1)
    }

    if (this.lifetime <= -2) {
      this.kill()
      if (this.isTower) {
        this.scene.sound.play('talk', { rate: 0.1 })
      }
    }
    if (
      (this.x < x + 30 ||
        this.x > w + 20 ||
        this.y < y + 16 ||
        this.y > h + 8) &&
      this.visible
    ) {
      this.setActive(false)
      this.setVisible(false)
    }
  }

  get _body() {
    return this.body as Phaser.Physics.Arcade.Body
  }

  takeDamage(amount = 1) {
    this.health -= amount
    if (this.health <= 0) {
      this.kill()
    }
  }

  emitParticles() {
    if (this.hitEnemies.length > 0 || this.explodeRadius > 0) {
      this._scene.antivirus.particles.setConfig({
        speedX: { min: -this.particleSpeed, max: this.particleSpeed },
        speedY: { min: -this.particleSpeed, max: this.particleSpeed },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 600, max: 1000 },
        tint: this.fillColor,
      })
      this._scene.antivirus.particles.emitParticle(
        this.particleCount,
        this.x,
        this.y,
      )
    }
  }

  emitStain() {
    if (this.stainSize > 0) {
      const size = this.stainSize
      this._scene.antivirus.stains.setConfig({
        speedX: 0,
        speedY: 0,
        scale: size,
        alpha: { start: 0.5, end: 0 },
        lifespan: {
          max: this.particleLifespan * 1.1,
          min: this.particleLifespan * 0.9,
        },
        tint: this.fillColor,
      })
      this._scene.antivirus.stains.emitParticle(
        1,
        this.x - size / 2,
        this.y - size / 2,
      )
    }
  }

  kill() {
    if (!this.visible) return

    this._body.setVelocity(0)
    this.setVisible(false)
    this.emitParticles()
    this.emitStain()

    const enemies = this._scene.antivirus.enemies.getChildren() as Enemy[]

    if (this.explodeTween) this.explodeTween.destroy()
    this.explodeCircle
      .setPosition(this.x, this.y)
      .setDisplaySize(this.explodeRadius, this.explodeRadius)
      .setFillStyle(this.fillColor)
      .setAlpha(this.isBucket ? 1 : 0.65)

    this.image.setAlpha(0)
    this.image2.setAlpha(0)

    const duration =
      this.explodeRadius === 0
        ? 10
        : Phaser.Math.RND.between(
            this.particleLifespan * 0.9,
            this.particleLifespan * 1.1,
          )
    this.explodeTween = this.scene.tweens.add({
      targets: this.explodeCircle,
      duration,
      alpha: 0,
      onComplete: () => this.setActive(false),
    })

    if (this.isMine) {
      this.scene.sound.play('mine-explode', {
        rate: 0.8 + Phaser.Math.RND.frac() / 4,
      })
    } else if (this.explodeRadius > 0) {
      this.scene.sound.play('bullet-explode', {
        rate: 0.8 + Phaser.Math.RND.frac() / 4,
      })
    }
    const closeEnough = enemies.filter((e) => {
      if (!e.active) return false

      return (
        Phaser.Math.Distance.BetweenPoints(this.getCenter(), e.getCenter()) <
        this.explodeRadius / 1.8
      )
    })
    this.setPosition(-10, -10)

    this.scene.time.delayedCall(this.isMine ? 350 : 100, () => {
      closeEnough.forEach((e) => e.damage(this))
    })
  }

  moveToward(
    p: Phaser.Math.Vector2 | Phaser.Types.Math.Vector2Like | number | undefined,
    options: Weapon,
  ) {
    if (typeof p === 'undefined') return
    this.damage = options.damage
    this.setSize(options.bulletSize, options.bulletSize)
    this.health = options.health
    this.lifetime = options.lifetime
    this.speed = options.speed
    this.maxShootTime = options.shootTime ?? 0
    this.shootTime = options.shootTime ?? 0
    this.setupTime = options.setupTime
    this.maxSetupTime = options.setupTime
    this.explodeRadius = options.explodeRadius
    this.explodeDamage = options.explodeDamage ?? 0
    this.maxLifetime = options.lifetime
    this.isTower = !!options.isTower
    this.isEraser = !!options.isEraser
    this.isMine = !!options.isMine
    this.isBucket = !!options.isBucket
    this.particleCount = options.particleCount ?? 0
    this.particleLifespan = options.particleLifespan ?? 9000
    this.stainSize = options.stainSize ?? 0
    this.particleSpeed = options.particleSpeed ?? 10
    this.hitEnemies = []

    if (!options.isFromTower)
      this.setFillStyle(this.scene.data.get('foregroundColor'))

    if (this.isTower || this.isMine) {
      this.image.x = Math.round(this.x)
      this.image.y = Math.round(this.y)
      this.image2.x = Math.round(this.x)
      this.image2.y = Math.round(this.y)

      if (this.isMine) {
        this.image.setTexture('mine-outline')
        this.image.setTint(this.scene.data.get('foregroundColor'))
        this.image.setAlpha(1)
        this.image2.setAlpha(0)
      }
      if (this.isTower) {
        this.image.setTexture('spray')
        this.image.setTint(this.scene.data.get('foregroundColor'))
        this.image.setAlpha(1)
        this.image2.setTexture('spray-top')
        this.image2.setAlpha(1)
      }
    }

    const size = options.bodySize ?? options.bulletSize
    let offset = 0
    if (this.isTower || this.isMine) offset = -size / 2
    this._body.setCircle(size / 2, offset, offset)
    this._body.isCircle = true
    this.setVisible(true).setActive(true)
    const ang =
      typeof p === 'number'
        ? p
        : Phaser.Math.Angle.BetweenPoints(this.getCenter(), p)
    this.body!.velocity.x = Math.cos(ang) * this.speed
    this.body!.velocity.y = Math.sin(ang) * this.speed
  }
}
