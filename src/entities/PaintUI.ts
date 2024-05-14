import { Game } from '../scenes/Game'

const COLORS = [
  0x000000, 0xea3323, 0x75fb4c, 0x0000f5, 0xffff54, 0xea33f7, 0x75fbfd,
]
export class PaintUI {
  scene: Game
  constructor(scene: Game, x: number, y: number, w: number, h: number) {
    this.scene = scene

    const graphics = this.scene.add.graphics().setDepth(2)
    // main window
    graphics
      .lineStyle(1, 0)
      .fillStyle(14277081)
      .fillRect(x, y, w, h)
      .strokeRect(x, y, w, h)

    // title bar
    graphics
      .fillStyle(526459)
      .fillRect(x + 1, y + 2, w - 3, 10)
      .lineBetween(x, y + 13, w + x, y + 13)
    this.scene.add.bitmapText(x + 3, y + 1, 'clarity', 'Painty', 8).setDepth(10)

    // weapon bar
    graphics
      .fillStyle(14277081)
      .fillRect(x + 2, y + 15, 25, h - 17)
      .strokeRect(x + 2, y + 15, 25, h - 17)

    const rectangles2: Phaser.GameObjects.Rectangle[] = []
    const borderRectangles: Phaser.GameObjects.Rectangle[] = []
    const reloadRectangles: Phaser.GameObjects.Rectangle[] = []
    const weaponAmmo: Phaser.GameObjects.Rectangle[][] = []
    const weaponAmmoMax: Phaser.GameObjects.Rectangle[][] = []

    this.scene.events.on('changedata', (_: any, key: string, value: any) => {
      if (key === 'toolIndex') {
        rectangles2.forEach((r) => r.setFillStyle(0xffffff))
        rectangles2[value].setFillStyle(0xffffff)
        borderRectangles.forEach((r) => r.setFillStyle(0xaaaaaa))
        borderRectangles[value].setFillStyle(0x000000)
      }
    })
    // weapon buttons
    for (let i = 0; i < 6; i++) {
      const borderRectangle = this.scene.add
        .rectangle(x + 3, 27 + i * 25, 22, 22, 0x000000)
        .setOrigin(0, 0)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => {
          this.scene.data.set('toolIndex', i)
        })
      const rectangle = this.scene.add
        .rectangle(x + 4, 28 + i * 25, 20, 20, i === 0 ? 0xaaaaaa : 0xffffff)
        .setOrigin(0, 0)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => {
          this.scene.data.set('toolIndex', i)
        })

      this.scene.add
        .sprite(x + 6, 30 + i * 25, 'icons', i)
        .setOrigin(0)
        .setDepth(12)
      rectangles2.push(rectangle)
      borderRectangles.push(borderRectangle)

      const reloadRectangle = this.scene.add
        .rectangle(x + 4, 48 + i * 25, 20, 0, 0xcccccc)
        .setOrigin(0, 1)
        .setDepth(11)

      // @ts-ignore
      reloadRectangle.updateHeight = (n: number) => {
        const _n = n === 1 ? 0 : n
        reloadRectangle.y = 48 - 20 * _n + i * 25
        reloadRectangle.height = 20 * _n
      }

      reloadRectangles.push(reloadRectangle)

      weaponAmmo.push([])
      weaponAmmoMax.push([])

      for (let j = 0; j < 9; j++) {
        const rectangle2 = this.scene.add
          .rectangle(x + 5 + j * 2, 50 + i * 25, 1, 1, 0x999999)
          .setOrigin(0, 0)
          .setAlpha(0)
          .setDepth(10)
        const rectangle = this.scene.add
          .rectangle(x + 5 + j * 2, 50 + i * 25, 1, 1, 0x000000)
          .setOrigin(0, 0)
          .setAlpha(0)
          .setDepth(10)

        weaponAmmo[i].push(rectangle)
        weaponAmmoMax[i].push(rectangle2)
      }
    }

    this.scene.events.on('updateammo', () => {
      this.scene.antivirus.weapons.forEach((w, i) => {
        // @ts-ignore
        reloadRectangles[i].updateHeight(1 - w.reloadTiming / w.reloadRate)

        weaponAmmo[i].forEach((r, j) => {
          r.setAlpha(w.ammo > j ? 1 : 0)
        })

        weaponAmmoMax[i].forEach((r, j) => {
          r.setAlpha(w.maxAmmo > j ? 1 : 0)
        })
      })
    })

    // color bar
    graphics
      .fillStyle(14277081)
      .fillRect(x + w - 27, y + 15, 25, h - 17)
      .strokeRect(x + w - 27, y + 15, 25, h - 17)

    const rectangles: Phaser.GameObjects.Rectangle[] = [
      this.scene.add
        .rectangle(x + w - 25 + 1, 28 + 1, 18, 18, 0x000000)
        .setOrigin(0, 0)
        .setDepth(10),
      this.scene.add
        .rectangle(x + w - 25, 28, 20, 20, 0xaaaaaa)
        .setOrigin(0, 0)
        .setDepth(9),
    ]

    const borderRectangles2: Phaser.GameObjects.Rectangle[] = []

    this.scene.events.on('changedata', (_: any, key: string, value: any) => {
      if (key === 'foregroundColor') {
        const index = COLORS.indexOf(value)
        rectangles2.forEach((r) => r.setFillStyle(0xffffff))
        rectangles2[index].setFillStyle(0xffffff)
        borderRectangles2.forEach((r) => r.setFillStyle(0xaaaaaa))
        borderRectangles2[index].setFillStyle(0xffffff)
      }
    })

    // color buttons
    for (let i = 1; i < 8; i++) {
      const rectangle2 = this.scene.add
        .rectangle(
          x + w - 25 + (i === 0 ? 0 : 3),
          i === 0 ? 28 : 34 + i * 17,
          i === 0 ? 30 : 15,
          i === 0 ? 30 : 15,
          0xffffff,
        )
        .setOrigin(0, 0)
        .setDepth(10)
      const rectangle = this.scene.add
        .rectangle(
          x + w - 25 + (i === 0 ? 0 : 3) + 1,
          i === 0 ? 28 : 34 + i * 17 + 1,
          i === 0 ? 20 : 13,
          i === 0 ? 20 : 13,
          COLORS[i - 1],
        )
        .setOrigin(0, 0)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => {
          rectangles[0].setFillStyle(COLORS[i - 1])
          this.scene.data.set('foregroundColor', COLORS[i - 1])
        })

      rectangles.push(rectangle)
      borderRectangles2.push(rectangle2)
    }
    this.scene.data.set('foregroundColor', 0x000000)
    this.scene.data.set('toolIndex', 0)
  }
}
