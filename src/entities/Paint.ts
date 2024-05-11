import { Game } from '../scenes/Game'

const COLORS = [
  0xffffff, 0xaaaaaa, 0x444444, 0x000000, 0xff0000, 0x00ff00, 0x0000ff,
]
export class Paint {
  scene: Game
  constructor(scene: Game, x: number, y: number, w: number, h: number) {
    this.scene = scene

    const graphics = this.scene.add.graphics().setDepth(2)
    // main window
    graphics
      .lineStyle(1, 0)
      .fillStyle(14277081)
      .fillRect(x, y, w, h)
      .strokeRect(x, y, w, h)

    // title bar
    graphics
      .fillStyle(526459)
      .fillRect(x + 1, y + 2, w - 3, 10)
      .lineBetween(x, y + 13, w + x, y + 13)
    this.scene.add.bitmapText(x + 3, y + 1, 'clarity', 'Paint', 8).setDepth(10)

    // weapon bar
    graphics
      .fillStyle(14277081)
      .fillRect(x + 2, y + 15, 25, h - 17)
      .strokeRect(x + 2, y + 15, 25, h - 17)

    const rectangles2: Phaser.GameObjects.Rectangle[] = []
    // weapon buttons
    for (let i = 0; i < 6; i++) {
      const rectangle = this.scene.add
        .rectangle(x + 4, 28 + i * 21, 20, 20, i === 0 ? 0xaaaaaa : 0xffffff)
        .setOrigin(0, 0)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => {
          rectangles2.forEach((r) => r.setFillStyle(0xffffff))
          rectangle.setFillStyle(0xaaaaaa)
          this.scene.data.set('toolIndex', i)
        })

      this.scene.add
        .sprite(x + 6, 30 + i * 21, 'icons', i)
        .setOrigin(0)
        .setDepth(10)
      rectangles2.push(rectangle)
    }

    // color bar
    graphics
      .fillStyle(14277081)
      .fillRect(x + w - 27, y + 15, 25, h - 17)
      .strokeRect(x + w - 27, y + 15, 25, h - 17)

    const rectangles: Phaser.GameObjects.Rectangle[] = [
      this.scene.add
        .rectangle(x + w - 25, 28, 20, 20, 0x000000)
        .setOrigin(0, 0)
        .setDepth(10),
    ]

    // color buttons
    for (let i = 1; i < 7; i++) {
      const rectangle = this.scene.add
        .rectangle(x + w - 25, 28 + i * 21, 20, 20, COLORS[i - 1])
        .setOrigin(0, 0)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => {
          rectangles[0].setFillStyle(COLORS[i - 1])
          this.scene.data.set('foregroundColor', COLORS[i - 1])
        })

      rectangles.push(rectangle)
    }
  }
}
