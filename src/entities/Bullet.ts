import { h, w, x, y } from '../constants'

export class Bullet extends Phaser.GameObjects.Rectangle {
  moveTimer: number
  damage: number
  health: number
  lifetime: number
  speed: number
  maxLifetime: number
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 2, 2, scene.data.values.foregroundColor)
    scene.physics.add.existing(this)
    this.setDepth(99)

    this.scene.data.events.on('changedata', (_: any, b: string, c: any) => {
      if (b === 'foregroundColor') this.setFillStyle(c)
    })
  }
  update() {
    this.lifetime--

    this.setAlpha(0.1 + this.lifetime / this.maxLifetime)
    if (this.lifetime <= 0) {
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
  }

  moveToward(
    p: Phaser.Math.Vector2,
    options: {
      damage: number
      bulletSize: number
      health: number
      speed: number
      lifetime: number
    },
  ) {
    if (!p) return
    this.damage = options.damage
    this.setSize(options.bulletSize, options.bulletSize)
    this.health = options.health
    this.lifetime = options.lifetime
    this.speed = options.speed
    this.maxLifetime = options.lifetime

    this._body.setSize(options.bulletSize, options.bulletSize)
    this.setVisible(true).setActive(true)
    const ang = Phaser.Math.Angle.BetweenPoints(this.getCenter(), p)
    this.body!.velocity.x = Math.cos(ang) * this.speed
    this.body!.velocity.y = Math.sin(ang) * this.speed
  }
}
