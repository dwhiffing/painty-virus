import { BULLET_DEPTH, INITIAL_WEAPONS, Weapon, h, w, x, y } from '../constants'
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
  isMine: boolean
  shootTime: number
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
    this.hitEnemies = []

    this.explodeCircle = this.scene.add
      .circle(10, 10, 10, 0x000000)
      .setAlpha(0)
      .setDepth(BULLET_DEPTH + 1)
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
      if (this.maxSetupTime > 0) this.scene.sound.play('talk', { rate: 0.5 })
      if (this.maxSetupTime === INITIAL_WEAPONS[3].setupTime)
        this.image.setAlpha(1)
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
    this._body.setVelocity(0)
    const enemies = this._scene.antivirus.enemies.getChildren() as Enemy[]

    if (this.explodeTween) this.explodeTween.destroy()
    this.explodeCircle
      .setPosition(this.x, this.y)
      .setDisplaySize(this.explodeRadius, this.explodeRadius)
      .setFillStyle(this.fillColor)
      .setAlpha(1)

    this.image.setAlpha(0)

    this.explodeTween = this.scene.tweens.add({
      targets: this.explodeCircle,
      alpha: 0,
    })

    if (this.explodeRadius === INITIAL_WEAPONS[3].explodeRadius) {
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

    const damage = this.explodeDamage || this.damage

    this.setPosition(-10, -10)
    this.scene.time.delayedCall(this.isMine ? 350 : 100, () => {
      closeEnough.forEach((e) => e.damage(damage))
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
    this.isTower = !!options.isTower
    this.maxShootTime = options.shootTime ?? 0
    this.shootTime = options.shootTime ?? 0
    this.setupTime = options.setupTime
    this.maxSetupTime = options.setupTime
    this.explodeRadius = options.explodeRadius
    this.explodeDamage = options.explodeDamage ?? 0
    this.maxLifetime = options.lifetime
    this.hitEnemies = []
    this.isMine = this.maxSetupTime === INITIAL_WEAPONS[3].setupTime

    if (!options.isFromTower)
      this.setFillStyle(this.scene.data.get('foregroundColor'))

    if (this.isTower || this.isMine) {
      this.image.x = Math.round(this.x)
      this.image.y = Math.round(this.y)

      this.image.setTexture(this.isMine ? 'mine' : 'spray')

      if (this.isMine) {
        this.image.setTexture('mine')
        this.image.setTint(this.scene.data.get('foregroundColor'))
        this.image.setAlpha(0.3)
      }
      if (this.isTower) {
        this.image.setTexture('spray')
        this.image.clearTint()
        this.image.setAlpha(1)
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
