import { Game as GameScene } from './scenes/Game'
import { Boot } from './scenes/Boot'
import { Menu } from './scenes/Menu'
import { AUTO, Game, Scale, Types } from 'phaser'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, Menu, GameScene],
}

export default new Game(config)
