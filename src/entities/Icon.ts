import { Game } from '../scenes/Game'

export class Icon {
  scene: Game
  constructor(scene: Game, x: number, y: number, onClick: () => void) {
    this.scene = scene

    const icon = this.scene.add
      .sprite(x, y, 'icon')
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
