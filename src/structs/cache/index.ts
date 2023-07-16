import { PlayerCache } from './PlayerCache.js'

export class Cache {
    readonly players: PlayerCache

    constructor() {
        this.players = new PlayerCache()
    }
}