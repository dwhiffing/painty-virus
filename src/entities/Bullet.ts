import { h, w, x, y } from '../constants'

export class Bullet extends Phaser.GameObjects.Rectangle {
  moveTimer: number
  damage: number
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 2, 2, scene.data.values.foregroundColor)
    scene.physics.add.existing(this)
    this.setDepth(99)

    this.scene.data.events.on('changedata', (_: any, b: string, c: any) => {
      if (b === 'foregroundColor') this.setFillStyle(c)
    })
  }
  update() {
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

  moveToward(p: Phaser.Math.Vector2, damage = 1) {
    if (!p) return
    this.damage = damage
    this.setVisible(true).setActive(true)
    const ang = Phaser.Math.Angle.BetweenPoints(this.getCenter(), p)
    this.body!.velocity.x = Math.cos(ang) * 100
    this.body!.velocity.y = Math.sin(ang) * 100
  }
}
