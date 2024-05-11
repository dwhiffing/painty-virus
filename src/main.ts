import { Game as GameScene } from './scenes/Game'
import { Boot } from './scenes/Boot'
import { Menu } from './scenes/Menu'
import { AUTO, Game, Scale, Types } from 'phaser'

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 320,
  height: 200,
  pixelArt: true,
  parent: 'game-container',
  backgroundColor: '#4F8082',
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
  scale: {
    zoom: Phaser.Scale.MAX_ZOOM,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, Menu, GameScene],
}

export default new Game(config)
