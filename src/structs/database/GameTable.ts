import type {
    GameLocation,
    GameType,
    PrismaClient
} from '@prisma/client'

export class GameTable {
    #prisma: PrismaClient

    constructor(prisma: PrismaClient) {
        this.#prisma = prisma
    }

    async insertGame(
        submitter: string,
        playerOne: string,
        playerTwo: string,
        playerThree: string,
        playerFour: string,
        playerOneScore: number,
        playerTwoScore: number,
        playerThreeScore: number,
        playerFourScore: number,
        leftoverPoints: number,
        location: GameLocation,
        type: GameType,
    ): Promise<number> {
        const row = await this.#prisma.game.create({
            data: {
               submitter,
               playerOne,
               playerTwo,
               playerThree,
               playerFour,
               playerOneScore,
               playerTwoScore,
               playerThreeScore,
               playerFourScore,
               leftoverPoints,
               location,
               type,
            }
        })

        return row.id
    }
}