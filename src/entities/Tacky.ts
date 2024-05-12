import { Game } from './Game'

// TODO: need clippy placeholder sprite
// TODO: need to make window for antivirus alert
const INTRO_MESSAGES = [
  'Welcome',
  'Open paint and draw me a picture!',
  '', // game waits until you open paint + 90 seconds
  '', // alert opens, says "Last PaintUI Virus scan was 90 days ago"
  'its supposed to do that!',
  '', // clippy waits until player clicks "Delete viruses", then waits for alert scan animation
  'Looks like you need to enter manual threat detection mode!',
  '', // Game switches to anti virus mode
]
export class Tacky extends Phaser.GameObjects.Sprite {
  text: Phaser.GameObjects.BitmapText
  textBox: Phaser.GameObjects.Rectangle

  constructor(scene: Game) {
    super(scene, 320 - 16, 200 - 23, 'tacky')

    this.text = this.scene.add
      .bitmapText(
        320 - 88,
        200 - 40,
        'clarity',
        '',
        // 'Welcome',
        // 'Short message',
        // 'This is the longest message possible',
        // 'Here are some more words',
        // 'Welcome! this is a bunch of words',
        8,
      )
      .setTint(0)
      .setOrigin(0, 1)
      .setMaxWidth(80)
      .setDepth(101)

    this.scene.add.existing(this)

    this.setDepth(102)

    this.textBox = this.scene.add
      .rectangle(320 - 5, 200 - 37, 87, this.text.height + 6, 13421721)
      .setStrokeStyle(1, 6710886)
      .setOrigin(1, 1)
      .setDepth(100)
      .setVisible(false)
  }

  say(text: string): Promise<void> {
    this.textBox.setVisible(true)
    this.text.text = text
    this.textBox.setSize(87, this.text.height + 6)
    this.play('tacky')

    return new Promise((resolve) => {
      this.scene.time.delayedCall(3000, () => {
        this.textBox.setVisible(false)
        this.play('tacky-idle')
        this.text.text = ''
        resolve()
      })
    })
  }
}
