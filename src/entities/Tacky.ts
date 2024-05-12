import { Game } from '../scenes/Game'

export class Tacky extends Phaser.GameObjects.Sprite {
  text: Phaser.GameObjects.BitmapText
  textBox: Phaser.GameObjects.Rectangle

  constructor(scene: Game) {
    super(scene, 320 - 16, 200 - 23, 'tacky')

    this.text = this.scene.add
      .bitmapText(320 - 88, 200 - 40, 'clarity', '', 8)
      .setTint(0)
      .setOrigin(0, 1)
      .setMaxWidth(80)
      .setDepth(10001)

    this.scene.add.existing(this)

    this.setDepth(10002)

    this.textBox = this.scene.add
      .rectangle(320 - 5, 200 - 37, 87, this.text.height + 6, 13421721)
      .setStrokeStyle(1, 6710886)
      .setOrigin(1, 1)
      .setDepth(10000)
      .setVisible(false)
  }

  say(text: string): Promise<void> {
    this.textBox.setVisible(true)
    this.text.text = text
    this.textBox.setSize(87, this.text.height + 6)
    this.play('tacky')

    let timeout = 2000
    if (text.length > 15) {
      timeout = 3000
    } else if (text.length > 30) {
      timeout = 5000
    }

    return new Promise((resolve) => {
      this.scene.time.delayedCall(timeout, () => {
        this.textBox.setVisible(false)
        this.play('tacky-idle')
        this.text.text = ''
        resolve()
      })
    })
  }
}
