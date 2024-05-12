import { Game } from '../scenes/Game'

export class Alert {
  scene: Game
  constructor(scene: Game, type: string) {
    this.scene = scene

    const x = 60
    const y = type === 'about' ? 40 : 60
    const w = 200
    const h = type === 'about' ? 120 : 80
    const title = type === 'about' ? 'credits' : 'alert'

    const graphics = this.scene.add.graphics().setDepth(50)
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
    this.scene.add.bitmapText(x + 3, y + 1, 'clarity', title, 8).setDepth(52)

    if (type === 'about') {
      this.scene.add
        .bitmapText(
          x + 5,
          y + 20,
          'clarity',
          'By Daniel Whiffing\n\nFor tojam 2024',
          8,
        )
        .setTint(0x000000)
        .setDepth(52)

      this.scene.add
        .image(x + w - 10, y + 30, 'goat')
        .setDepth(52)
        .setOrigin(1, 0)
    } else {
      this.scene.add
        .bitmapText(
          x + 50,
          y + 30,
          'clarity',
          'Last Virus scan was 99999 days ago',
          8,
        )
        .setTint(0x000000)
        .setMaxWidth(w - 60)
        .setCenterAlign()
        .setDepth(52)

      this.scene.add
        .bitmapText(x + 90, y + 60, 'clarity', 'Ok', 8)
        .setTint(0x000000)
        .setDepth(52)

      this.scene.add
        .rectangle(x + 80, y + 60, 34, 12, 0xaaaaaa)
        .setDepth(51)
        .setOrigin(0)

      this.scene.add
        .image(x + 5, y + 20, 'alert')
        .setDepth(52)
        .setOrigin(0, 0)
    }
  }
}
