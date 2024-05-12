import { Game } from '../scenes/Game'

export class Icon {
  scene: Game
  constructor(
    scene: Game,
    x: number,
    y: number,
    texture: string,
    text: string,
    onClick: () => void,
  ) {
    this.scene = scene

    const icon = this.scene.add
      .sprite(x, y, texture)
      .setOrigin(0, 0)
      .setInteractive()

    this.scene.add.bitmapText(x, y + 33, 'clarity', text, 8).setCenterAlign()

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
