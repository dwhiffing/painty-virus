import { Weapon, h, w, x, y } from '../constants'
import { Game } from '../scenes/Game'
import { Enemy } from './Enemy'

export class Bullet extends Phaser.GameObjects.Rectangle {
  _scene: Game
  moveTimer: number
  damage: number
  health: number
  lifetime: number
  speed: number
  isTower: boolean
  shootTime: number
  maxShootTime: number
  explodeRadius: number
  explodeDamage: number
  explodeTween: Phaser.Tweens.BaseTween
  explodeCircle: Phaser.GameObjects.Arc
  maxLifetime: number
  setupTime: number
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, 2, 2, scene.data.values.foregroundColor)
    this._scene = scene
    scene.physics.add.existing(this)
    this.setDepth(99)

    this.setMask(this._scene.antivirus.mask)

    this.explodeCircle = this.scene.add
      .circle(10, 10, 10, 0x000000)
      .setAlpha(0)
      .setDepth(100)
      .setMask(this._scene.antivirus.mask)
  }
  update() {
    if (this.maxLifetime > -1) {
      this.lifetime--
    }
    if (this.shootTime > -1) {
      this.shootTime--
    }

    if (this.setupTime > 0) {
      this.setAlpha(0.5)
      this.setupTime--
    } else if (this.alpha !== 1) {
      this.setAlpha(1)
    }

    if (this.lifetime <= -2) {
      this.kill()
    }
    if (
      this.x < x + 30 ||
      this.x > w + 20 ||
      this.y < y + 16 ||
      this.y > h + 8
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

  kill() {
    this.setVisible(false).setActive(false)
    const enemies = this._scene.antivirus.enemies.getChildren() as Enemy[]

    if (this.explodeTween) this.explodeTween.destroy()
    this.explodeCircle
      .setPosition(this.x, this.y)
      .setDisplaySize(this.explodeRadius, this.explodeRadius)
      .setFillStyle(this.scene.data.get('foregroundColor'))
      .setAlpha(1)

    this.explodeTween = this.scene.tweens.add({
      targets: this.explodeCircle,
      alpha: 0,
    })
    const closeEnough = enemies.filter((e) => {
      if (!e.active) return false

      return (
        Phaser.Math.Distance.BetweenPoints(this.getCenter(), e.getCenter()) <
        this.explodeRadius / 1.8
      )
    })

    closeEnough.forEach((e) => e.damage(this.explodeDamage || this.damage))
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
    this.isTower = !!options.isTower
    this.maxShootTime = options.shootTime ?? 0
    this.shootTime = options.shootTime ?? 0
    this.setupTime = options.setupTime
    this.explodeRadius = options.explodeRadius
    this.explodeDamage = options.explodeDamage ?? 0
    this.maxLifetime = options.lifetime
    this.setFillStyle(this.scene.data.get('foregroundColor'))

    const size = options.bodySize ?? options.bulletSize
    this._body.setSize(size, size)
    this.setVisible(true).setActive(true)
    const ang =
      typeof p === 'number'
        ? p
        : Phaser.Math.Angle.BetweenPoints(this.getCenter(), p)
    this.body!.velocity.x = Math.cos(ang) * this.speed
    this.body!.velocity.y = Math.sin(ang) * this.speed
  }
}
