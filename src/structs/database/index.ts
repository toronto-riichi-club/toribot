import { GameTable } from './GameTable.js'
import { PlayerTable } from './PlayerTable.js'
import { PrismaClient } from '@prisma/client'

export class Database {
    #prisma = new PrismaClient()

    readonly games = new GameTable(this.#prisma)
    readonly players = new PlayerTable(this.#prisma)
}