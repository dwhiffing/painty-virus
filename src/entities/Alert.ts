import { ABOUT_ALERT_DEPTH, VIRUS_ALERT_DEPTH } from '../constants'
import { Game } from '../scenes/Game'

export class Alert {
  scene: Game
  open: boolean
  type: string
  buttonText: Phaser.GameObjects.BitmapText
  button: Phaser.GameObjects.Rectangle
  contents: any[]
  constructor(scene: Game, type: string) {
    this.scene = scene
    this.open = false
    this.type = type

    const x = 60
    const y = type === 'about' ? 40 : 60
    const w = 200
    const h = type === 'about' ? 120 : 80
    const depth = type === 'about' ? ABOUT_ALERT_DEPTH : VIRUS_ALERT_DEPTH
    const title = type === 'about' ? 'credits' : 'alert'

    this.contents = []

    const graphics = this.scene.add.graphics().setDepth(depth)
    // main window
    graphics
      .lineStyle(1, 0)
      .fillStyle(14277081)
      .fillRect(x, y, w, h)
      .strokeRect(x, y, w, h)
      .setAlpha(0)

    // title bar
    graphics
      .fillStyle(526459)
      .fillRect(x + 1, y + 2, w - 3, 10)
      .lineBetween(x, y + 13, w + x, y + 13)
    const titleText = this.scene.add
      .bitmapText(x + 3, y + 1, 'clarity', title, 8)
      .setDepth(depth + 2)
      .setAlpha(0)

    this.contents.push(graphics, titleText)

    if (type === 'about') {
      const text = this.scene.add
        .bitmapText(
          x + 5,
          y + 20,
          'clarity',
          'By Daniel Whiffing\n\nFor tojam 2024',
          8,
        )
        .setTint(0x000000)
        .setDepth(depth + 2)
        .setAlpha(0)

      const icon = this.scene.add
        .image(x + w - 10, y + 30, 'goat')
        .setDepth(depth + 2)
        .setOrigin(1, 0)
        .setAlpha(0)

      this.buttonText = this.scene.add
        .bitmapText(x + 90, y + 98, 'clarity', 'Ok', 8)
        .setTint(0x000000)
        .setDepth(depth + 2)
        .setAlpha(0)

      this.button = this.scene.add
        .rectangle(x + 80, y + 98, 34, 12, 0xaaaaaa)
        .setDepth(depth + 1)
        .setOrigin(0)
        .setInteractive()
        .setAlpha(0)

        .on('pointerdown', () => {
          this.hide()
        })

      this.contents.push(text, icon, this.button, this.buttonText)
    } else {
      const text = this.scene.add
        .bitmapText(
          x + 50,
          y + 30,
          'clarity',
          'Warning: Last scan found 999,999 viruses!',
          8,
        )
        .setTint(0x000000)
        .setMaxWidth(w - 60)
        .setCenterAlign()
        .setDepth(depth + 2)
        .setAlpha(0)

      this.buttonText = this.scene.add
        .bitmapText(x + 90, y + 60, 'clarity', 'Ok', 8)
        .setTint(0x000000)
        .setDepth(depth + 2)
        .setAlpha(0)

      this.button = this.scene.add
        .rectangle(x + 80, y + 60, 34, 12, 0xaaaaaa)
        .setDepth(depth + 1)
        .setOrigin(0)
        .setInteractive()
        .setAlpha(0)

        .on('pointerdown', () => {
          this.scene.events.emit('virusokclicked')
          this.hide()
        })

      const icon = this.scene.add
        .image(x + 5, y + 20, 'alert')
        .setDepth(depth + 1)
        .setOrigin(0, 0)
        .setAlpha(0)

      this.contents.push(text, icon, this.button, this.buttonText)
    }

    this.hide()
  }

  hide() {
    this.scene.time.delayedCall(100, () => {
      this.contents.forEach((c) => c.setAlpha(0))
      this.open = false
    })
  }
  show() {
    this.open = true
    this.contents.forEach((c) => c.setAlpha(1))

    if (this.type !== 'about') {
      this.button.setAlpha(0)
      this.button.setInteractive(false)
      this.buttonText.setAlpha(0)

      new Promise((resolve) => {
        this.scene.events.once('virusalertshowbutton', resolve)
      }).then(() => {
        this.button.setAlpha(1)
        this.buttonText.setAlpha(1)
        this.button.setInteractive(true)
      })
    }
  }
}
