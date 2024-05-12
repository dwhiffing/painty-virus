import { PaintUI } from '../entities/PaintUI'
import { Icon } from './Icon'
import { Game } from '../scenes/Game'

export class PaintWindow {
  scene: Game
  constructor(scene: Game, x: number, y: number, w: number, h: number) {
    this.scene = scene

    this.scene.data.set('toolIndex', 0)
    this.scene.data.set('foregroundColor', 0)
    this.scene.data.set('backgroundColor', 16777215)

    this.scene.cameras.main.setRoundPixels(false)
    new PaintUI(this.scene, x, y, w, h)
    new Icon(this.scene, 5, 5, () => {})

    const paintContainer = this.scene.add.graphics().setDepth(3)
    const paintGraphics = this.scene.add.graphics().setDepth(4)
    const linePreview = this.scene.add.graphics().setDepth(4)

    let activeSpray = { active: false, x: 0, y: 0 }
    let activeLine = { active: false, x: 0, y: 0 }

    // draw canvas bg
    paintContainer
      .lineStyle(1, 0)
      .fillStyle(16777215)
      .fillRect(x + 29, y + 15, h - 17, h - 17)
      .strokeRect(x + 29, y + 15, h - 17, h - 17)

    const isInCanvas = (p: { x: number; y: number }) => {
      if (p.x < x + 29 || p.x > x + h + 11) return false
      if (p.y < y + 16 || p.y > h + y - 3) return false
      return true
    }

    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      paintGraphics.closePath()
      if (this.scene.data.get('toolIndex') === 2) {
        if (activeLine.active) {
          linePreview.clear()
          paintGraphics
            .beginPath()
            .lineStyle(1, this.scene.data.get('foregroundColor'))
            .moveTo(activeLine.x, activeLine.y)
            .lineTo(p.x, p.y)
            .closePath()
            .strokePath()
        }
      }
      activeLine.active = false
      activeSpray.active = false
    })

    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!isInCanvas(p)) return

      paintGraphics.beginPath()

      if (this.scene.data.get('toolIndex') === 2 && !activeLine.active) {
        linePreview.moveTo(p.x, p.y)
        activeLine.x = p.x
        activeLine.y = p.y
        activeLine.active = true
      }

      if (this.scene.data.get('toolIndex') === 4) {
        if (!activeSpray.active) {
          activeSpray.active = true
          activeSpray.x = p.x
          activeSpray.y = p.y
        }
      }
      if (this.scene.data.get('toolIndex') === 5) {
        //TODO: bucket should flood fill instead
        paintGraphics
          .fillStyle(this.scene.data.get('foregroundColor'))
          .fillRect(x + 29, y + 16, h - 18, h - 18)
      }
    })

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!isInCanvas(p)) return

      let { toolIndex, foregroundColor, backgroundColor } =
        this.scene.data.getAll()

      if (toolIndex === 0) {
        if (Math.abs(p.downTime - this.scene.game.getTime()) < 100) {
          paintGraphics.moveTo(p.x, p.y)
        }

        if (p.isDown) {
          paintGraphics
            .lineStyle(1, foregroundColor)
            .lineTo(p.x, p.y)
            .strokePath()
        }
      } else if (toolIndex === 1) {
        // eraser
        if (Math.abs(p.downTime - this.scene.game.getTime()) < 100) {
          paintGraphics.moveTo(p.x, p.y)
        }

        if (p.isDown) {
          paintGraphics
            .lineStyle(4, backgroundColor)
            .lineTo(p.x, p.y)
            .strokePath()
        }
      } else if (toolIndex === 2) {
        // if (Math.abs(p.downTime - this.scene.game.getTime()) < 100) {
        //   paintGraphics.moveTo(p.x, p.y)
        // }
        if (p.isDown) {
          linePreview
            .clear()
            .lineStyle(1, foregroundColor)
            .moveTo(activeLine.x, activeLine.y)
            .lineTo(p.x, p.y)
            .strokePath()
        }
        // line
      } else if (toolIndex === 3) {
        // brush
        if (p.isDown) {
          paintGraphics.fillStyle(foregroundColor).fillCircle(p.x, p.y, 3)
        }
      } else if (toolIndex === 4) {
        // spray
        if (p.isDown) {
          if (isInCanvas(p)) {
            activeSpray.x = p.x
            activeSpray.y = p.y
          }
        }
      } else if (toolIndex === 5) {
        // bucket
      }
    })

    this.scene.time.addEvent({
      delay: 10,
      repeat: -1,
      callback: () => {
        const p = this.scene.input.activePointer
        if (p.isDown && activeSpray.active) {
          const p2 = randomCoordinateWithinRadius(p.x, p.y, 10)
          if (isInCanvas(p2)) {
            paintGraphics
              .fillStyle(this.scene.data.get('foregroundColor'))
              .fillRect(p2.x, p2.y, 1, 1)
          }
        }
      },
    })
  }

  update() {}
}
const randomCoordinateWithinRadius = (_x: number, _y: number, r: number) => {
  const angle = Math.random() * 2 * Math.PI
  const dist = Math.sqrt(Math.random()) * r
  const x = _x + dist * Math.cos(angle)
  const y = _y + dist * Math.sin(angle)
  return { x, y }
}
