import type { Player, PrismaClient } from '@prisma/client'

export class PlayerTable {
    #prisma: PrismaClient

    constructor(prisma: PrismaClient) {
        this.#prisma = prisma
    }

    async insertPlayer(
        username: string,
        userId?: bigint
    ): Promise<void> {
        await this.#prisma.$executeRawUnsafe(
            `
                INSERT INTO
                    public.player
                VALUES
                    ($1, $2)
                ON CONFLICT (username)
                DO NOTHING;
            `,
            username,
            userId
        )
    }

    async getPlayers(): Promise<Player[]> {
        const players = await this.#prisma.player.findMany()

        return players
    }
}