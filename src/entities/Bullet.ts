import { h, w, x, y } from '../constants'

export class Bullet extends Phaser.GameObjects.Rectangle {
  moveTimer: number
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 1, 1, scene.data.values.foregroundColor)
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
}
