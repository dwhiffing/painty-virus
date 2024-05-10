import { Scene } from 'phaser'

class Icon {
  scene: Game
  constructor(scene: Game, x: number, y: number, onClick: () => void) {
    this.scene = scene

    const w = 10
    const h = 10

    const icon = this.scene.add
      .rectangle(x, y, w + 2, h + 2, 0x000000)
      .setOrigin(0, 0)
      .setInteractive({ draggable: true })

    let lastTime = 0
    icon.on('pointerdown', () => {
      let clickDelay = this.scene.time.now - lastTime
      lastTime = this.scene.time.now
      if (clickDelay < 350) {
        onClick()
      }
    })
  }
}

let d = 0
class OSWindow {
  scene: Game
  titleBarStroke: any
  titleBar: any
  innerStroke: any
  inner: any
  closeButton: any
  constructor(scene: Game, x: number, y: number, w: number, h: number) {
    this.scene = scene

    this.titleBarStroke = this.scene.add
      .rectangle(x, y, w + 2, h + 2, 0x000000)
      .setOrigin(0, 0)
      .setInteractive({ draggable: true })

    this.titleBar = this.scene.add
      .rectangle(x + 1, y + 1, w, h, 0x999999)
      .setOrigin(0, 0)

    this.innerStroke = this.scene.add
      .rectangle(x, y + 10, w + 2, 102, 0x000000)
      .setOrigin(0, 0)

    this.inner = this.scene.add
      .rectangle(x + 1, y + 11, w, 100, 0xffffff)
      .setOrigin(0, 0)

    this.closeButton = this.scene.add
      .rectangle(x + w - 7, y + 2, 7, 7, 0x000000)
      .setOrigin(0, 0)
      .setInteractive()

    this.titleBarStroke.on('drag', (_: any, x: number, y: number) => {
      this.titleBarStroke.setPosition(x, y)
      this.titleBar.setPosition(x + 1, y + 1)
      this.innerStroke.setPosition(x, y + 10)
      this.inner.setPosition(x + 1, y + 11)
      this.closeButton.setPosition(x + w - 7, y + 2)

      this.setDepth(++d)
    })

    this.closeButton.on('pointerup', () => {
      this.titleBarStroke.destroy()
      this.titleBar.destroy()
      this.innerStroke.destroy()
      this.inner.destroy()
      this.closeButton.destroy()
    })
  }

  setDepth(d: number) {
    this.titleBarStroke.setDepth(d)
    this.titleBar.setDepth(d)
    this.innerStroke.setDepth(d)
    this.inner.setDepth(d)
    this.closeButton.setDepth(d)
  }
}

export class Game extends Scene {
  constructor() {
    super('Game')
  }

  create() {
    this.add.bitmapText(10, 10, 'clarity', 'Welcome', 8)

    const barHeight = 15

    const icon = new Icon(this, 10, 10, () => {
      const _window = new OSWindow(this, 10, 10, 100, 100)
    })

    this.add
      .graphics()
      .fillStyle(0x999999)
      .lineStyle(2, 0x000000)
      .strokeRect(
        0,
        this.game.scale.height - barHeight,
        this.game.scale.width,
        barHeight,
      )
      .fillRect(
        0,
        this.game.scale.height - barHeight,
        this.game.scale.width,
        barHeight,
      )
  }
}
