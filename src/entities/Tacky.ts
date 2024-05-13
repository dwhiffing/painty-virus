import { Game } from '../scenes/Game'

export class Tacky extends Phaser.GameObjects.Sprite {
  text: Phaser.GameObjects.BitmapText
  textBox: Phaser.GameObjects.Rectangle

  constructor(scene: Game) {
    super(scene, 320 - 16, 200 - 23, 'tacky')

    this.text = this.scene.add
      .bitmapText(320 - 88, 200 - 45, 'clarity', '', 8)
      .setTint(0)
      .setOrigin(0, 1)
      .setMaxWidth(80)
      .setDepth(10001)

    this.scene.add.existing(this)

    this.setDepth(10002)

    this.textBox = this.scene.add
      .rectangle(320 - 5, 200 - 42, 87, this.text.height + 6, 13421721)
      .setStrokeStyle(1, 6710886)
      .setOrigin(1, 1)
      .setDepth(10000)
      .setVisible(false)
  }

  say(text: string, _timeout?: number): Promise<void> {
    if (this.text.text !== '') return Promise.resolve()
    this.textBox.setVisible(true)
    this.play('tacky')
    this.text.text = ' '
    this.textBox.setSize(87, this.text.height + 6)

    let i = 0
    const event = this.scene.time.addEvent({
      delay: 80,
      repeat: text.length / 2,
      callback: () => {
        i += 2
        this.text.text = text.slice(0, i)
        this.textBox.setSize(87, this.text.height + 6)
        this.scene.sound.play('talk', { rate: 2, volume: 0.2 })
        if (i >= text.length) {
          this.scene.time.delayedCall(500, () => {
            this.play('tacky-idle')
          })
        }
      },
    })

    let timeout = _timeout ?? 1500 + text.length * 80

    return new Promise((resolve) => {
      this.scene.time.delayedCall(timeout, () => {
        event.destroy()
        this.textBox.setVisible(false)
        this.text.text = ''
        resolve()
      })
    })
  }
}
