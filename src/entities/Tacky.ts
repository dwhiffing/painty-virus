import { TACKY_DEPTH } from '../constants'
import { Game } from '../scenes/Game'

export class Tacky extends Phaser.GameObjects.Sprite {
  text: Phaser.GameObjects.BitmapText
  textBox: Phaser.GameObjects.Rectangle
  speechTickEvent: Phaser.Time.TimerEvent
  speechEndEvent: Phaser.Time.TimerEvent
  currentSpeech: string

  constructor(scene: Game) {
    super(scene, 320 - 16, 200 - 23, 'tacky')

    this.text = this.scene.add
      .bitmapText(320 - 88, 200 - 42, 'clarity', '', 8)
      .setTint(0)
      .setOrigin(0, 1)
      .setMaxWidth(80)
      .setDepth(TACKY_DEPTH + 1)

    this.scene.add.existing(this)
    this.setInteractive()

    this.setDepth(TACKY_DEPTH + 2)

    this.textBox = this.scene.add
      .rectangle(320 - 5, 200 - 39, 87, this.text.height + 6, 13421721)
      .setStrokeStyle(1, 6710886)
      .setOrigin(1, 1)
      .setDepth(TACKY_DEPTH)
      .setVisible(false)
      .setInteractive()
  }

  say(text: string, _timeout?: number): Promise<void> {
    this.currentSpeech = text
    this.play('tacky')
    this.setText(' ')

    this.off('pointerdown')
    this.textBox.off('pointerdown')
    this.speechTickEvent?.destroy()
    this.speechEndEvent?.destroy()

    let i = 0
    this.speechTickEvent = this.scene.time.addEvent({
      delay: 80,
      repeat: text.length / 2,
      callback: () => {
        i += 2
        this.setText(text.slice(0, i))
        this.scene.sound.play('talk', { rate: 2, volume: 0.2 })
        if (i >= text.length) {
          this.scene.time.delayedCall(500, () => this.play('tacky-idle'))
        }
      },
    })

    let timeout = _timeout ?? 1500 + text.length * 60

    return new Promise((resolve) => {
      const fn = () => {
        if (this.text.text === this.currentSpeech) resolve()
        this.skip()
      }
      this.textBox.on('pointerdown', fn)
      this.on('pointerdown', fn)
      this.speechEndEvent = this.scene.time.delayedCall(timeout, fn)
    })
  }

  skip = () => {
    this.speechTickEvent.destroy()
    this.play('tacky-idle')
    if (this.text.text === this.currentSpeech || this.text.text === '') {
      this.speechEndEvent.destroy()
      return this.setText('')
    }
    this.setText(this.currentSpeech)
  }

  setText = (text: string) => {
    this.text.text = text
    this.textBox.setSize(87, this.text.height + 6)
    this.textBox.setVisible(text !== '')
  }
}
