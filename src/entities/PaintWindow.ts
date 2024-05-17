import { PAINT_WINDOW_DEPTH } from '../constants'
import { PaintUI } from '../entities/PaintUI'
import { Game, isInCanvas } from '../scenes/Game'

export class PaintWindow {
  scene: Game
  paintGraphics: Phaser.GameObjects.Graphics
  constructor(scene: Game, x: number, y: number, w: number, h: number) {
    this.scene = scene

    this.scene.data.set('toolIndex', 0)
    this.scene.data.set('foregroundColor', 0)
    this.scene.data.set('backgroundColor', 16777215)

    this.scene.cameras.main.setRoundPixels(false)
    new PaintUI(this.scene, x, y, w, h)

    const paintContainer = this.scene.add
      .graphics()
      .setDepth(PAINT_WINDOW_DEPTH)
    this.paintGraphics = this.scene.add
      .graphics()
      .setDepth(PAINT_WINDOW_DEPTH + 1)
      .setMask(
        this.scene.add
          .rectangle(x + 29, y + 16, w - 59, h - 18, 0x000000)
          .setOrigin(0)
          .setVisible(false)
          .createGeometryMask(),
      )
    const linePreview = this.scene.add
      .graphics()
      .setDepth(PAINT_WINDOW_DEPTH + 1)

    let activeSpray = { active: false, x: 0, y: 0 }
    let activeLine = { active: false, x: 0, y: 0 }

    // draw canvas bg
    paintContainer
      .lineStyle(1, 0)
      .fillStyle(16777215)
      .fillRect(x + 29, y + 15, h - 17, h - 17)
      .strokeRect(x + 29, y + 15, h - 17, h - 17)

    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      this.paintGraphics.closePath()
      if (this.scene.data.get('toolIndex') === 2) {
        if (activeLine.active) {
          linePreview.clear()
          this.paintGraphics
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
      if (
        !isInCanvas(p) ||
        this.scene.antivirus ||
        this.scene.aboutAlert.open ||
        this.scene.virusAlert.open
      )
        return

      this.scene.data.set('drewapicture', true)

      this.paintGraphics.beginPath()

      if (this.scene.data.get('toolIndex') === 0) {
        this.paintGraphics
          .fillStyle(this.scene.data.get('foregroundColor'))
          .fillRect(p.x - 1, p.y - 1, 1, 1)
      }

      if (this.scene.data.get('toolIndex') === 1) {
        this.paintGraphics
          .fillStyle(this.scene.data.get('backgroundColor'))
          .fillRect(p.x, p.y - 4, 6, 6)
      }

      if (this.scene.data.get('toolIndex') === 2 && !activeLine.active) {
        linePreview.moveTo(p.x, p.y)
        activeLine.x = p.x
        activeLine.y = p.y
        activeLine.active = true
      }

      if (this.scene.data.get('toolIndex') === 3) {
        this.paintGraphics
          .fillStyle(this.scene.data.get('foregroundColor'))
          .fillCircle(p.x, p.y, 6)
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
        this.paintGraphics
          .fillStyle(this.scene.data.get('foregroundColor'))
          .fillRect(x + 29, y + 16, h - 18, h - 18)
      }
    })

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (
        !isInCanvas(p) ||
        this.scene.antivirus ||
        this.scene.aboutAlert.open ||
        this.scene.virusAlert.open
      )
        return

      let { toolIndex, foregroundColor, backgroundColor } =
        this.scene.data.getAll()

      if (toolIndex === 0) {
        if (Math.abs(p.downTime - this.scene.game.getTime()) < 5) {
          this.paintGraphics.moveTo(p.x, p.y)
        }

        if (p.isDown) {
          this.paintGraphics
            .lineStyle(1, foregroundColor)
            .lineTo(p.x, p.y)
            .strokePath()
        }
      } else if (toolIndex === 1) {
        // eraser
        if (p.isDown) {
          this.paintGraphics
            .fillStyle(backgroundColor)
            .fillRect(p.x, p.y - 4, 6, 6)
        }
      } else if (toolIndex === 2) {
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
          this.paintGraphics.fillStyle(foregroundColor).fillCircle(p.x, p.y, 6)
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
        if (this.scene.antivirus) return

        const p = this.scene.input.activePointer
        if (p.isDown && activeSpray.active) {
          const p2 = randomCoordinateWithinRadius(p.x, p.y, 10)
          if (isInCanvas(p2)) {
            this.paintGraphics
              .fillStyle(this.scene.data.get('foregroundColor'))
              .fillRect(p2.x, p2.y, 1, 1)
          }
        }
      },
    })
  }

  clear() {
    this.paintGraphics.clear()
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
