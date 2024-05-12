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

    icon.on('pointerdown', () => {
      onClick()
    })
  }
}
