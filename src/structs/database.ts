import type {
    DatabaseGuildData,
    InPersonGameUpdate,
    PartialInPersonGame,
    RequireAtLeastOne
} from '#types/database'
import {
    type InPersonGame,
    type InPersonGameLocation,
    type OnlineGame,
    PrismaClient,
    type Tag,
    InPersonGameType
} from '@prisma/client'

export class Database {
    #prisma = new PrismaClient()

    async countInPersonGames(guildId: bigint, date: string, location: InPersonGameLocation): Promise<bigint> {
        const [{ count }] = await this.#prisma.$queryRawUnsafe<[{ count: bigint }]>(
            `
                SELECT
                    COUNT(*) AS count
                FROM
                    public.in_person_game
                WHERE
                    public.in_person_game.guild_id = $1
                    AND public.in_person_game.date = $2::DATE
                    AND public.in_person_game.location = $3::"InPersonGameLocation"
            `,
            guildId,
            date,
            location
        )

        return count
    }

    async countOnlineGames(guildId: bigint, date: string): Promise<bigint> {
        const [{ count }] = await this.#prisma.$queryRawUnsafe<[{ count: bigint }]>(
            `
                SELECT
                    COUNT(*) AS count
                FROM
                    public.online_game
                WHERE
                    public.online_game.guild_id = $1
                    AND public.online_game.date = $2::DATE
            `,
            guildId,
            date
        )

        return count
    }

    async deleteInPersonGame(guildId: bigint, id: number): Promise<InPersonGame> {
        try {
            const inPersonGame = await this.#prisma.inPersonGame.delete({ where: { guildId_id: { guildId, id } } })

            return inPersonGame
        } catch {
            return null
        }
    }

    async deleteOnlineGame(guildId: bigint, id: number): Promise<OnlineGame> {
        try {
            const onlineGame = await this.#prisma.onlineGame.delete({ where: { guildId_id: { guildId, id } } })

            return onlineGame
        } catch {
            return null
        }
    }

    async deleteTag(guildId: bigint, keyword: string): Promise<Tag> {
        try {
            const tag = await this.#prisma.tag.delete({ where: { guildId_keyword: { guildId, keyword } } })

            return tag
        } catch {
            return null
        }
    }

    async insertGuild(guildId: bigint): Promise<void> {
        await this.#prisma.$executeRawUnsafe(
            `
                INSERT INTO public.guild (guild_id)
                VALUES ($1)
                ON CONFLICT DO NOTHING;
            `,
            guildId
        )
    }

    async insertInPersonGame(guildId: bigint, results: Record<string, number>, location: InPersonGameLocation, type: InPersonGameType, notes: string): Promise<InPersonGame> {
        const { inPersonCount: id } = await this.#prisma.guild.update({
            data: { inPersonCount: { increment: 1 } },
            select: { inPersonCount: true },
            where: { guildId }
        })
        const players = Object.keys(results)
        const scores = Object.values(results)
        const inPersonGame = await this.#prisma.inPersonGame.create({
            data: {
                guildId,
                id,
                playerOneId: players[0],
                playerTwoId: players[1],
                playerThreeId: players[2],
                playerFourId: players?.[3] ?? null,
                playerOneScore: scores[0],
                playerTwoScore: scores[1],
                playerThreeScore: scores[2],
                playerFourScore: scores?.[3] ?? null,
                location,
                type,
                notes                
            }
        })
        
        return inPersonGame
    }

    async insertOnlineGame(guildId: bigint, url: string): Promise<OnlineGame> {
        const { onlineCount: id } = await this.#prisma.guild.update({
            data: { onlineCount: { increment: 1 } },
            select: { onlineCount: true },
            where: { guildId }
        })
        const onlineGame = await this.#prisma.onlineGame.create({
            data: {
                guildId,
                id,
                url
            }
        })
        
        return onlineGame
    }

    async insertTag(guildId: bigint, keyword: string, aliases: string[], content: string): Promise<Tag> {
        const tag = await this.#prisma.tag.create({ data: { guildId, keyword, aliases, content }})
        
        return tag
    }

    async isInvalidTagInput(guildId: bigint, keyword: string, aliases: string[] = [], excludeOwnKeyword = false): Promise<boolean> {
        const combinedTagInput: string[]  = [...new Set([keyword.toLowerCase(), ...aliases.map((a: string) => a.toLowerCase())])]
        const [{ isInvalidTagInput }] = await this.#prisma.$queryRawUnsafe<[{ isInvalidTagInput: boolean }]>(
            `
                SELECT
                    BOOL_OR(ARRAY[$2] && (ARRAY[LOWER(public.tag.keyword)] || LOWER(public.tag.aliases::TEXT)::TEXT[])) AS "isInvalidTagInput"
                FROM
                    public.tag
                WHERE
                    public.tag.guild_id = $1
                    ${ excludeOwnKeyword ? `AND public.tag.keyword != '${ keyword }'` : '' };
            `,
            guildId,
            combinedTagInput        
        )
        
        return isInvalidTagInput
    }

    async readGuild(guildId: bigint): Promise<DatabaseGuildData> {
        const inPersonGames = await this.#prisma.inPersonGame.findMany({ select: { date: true, location: true }, where: { guildId } })
        const onlineGames = await this.#prisma.onlineGame.findMany({ select: { date: true }, where: { guildId } })
        const tags = await this.#prisma.tag.findMany({ where: { guildId } })

        return {
            inPersonGames,
            onlineGames,
            tags
        }
    }

    async readInPersonGame(guildId: bigint, id: number): Promise<InPersonGame> {
        const inPersonGame = await this.#prisma.inPersonGame.findFirst({ where: { guildId, id } })

        return inPersonGame
    }

    async readPartialInPersonGamesByDateAndLocation(guildId: bigint, date: string, location: InPersonGameLocation): Promise<PartialInPersonGame[]> {
        const inPersonGames = await this.#prisma.$queryRawUnsafe<PartialInPersonGame[]>(
            `
                SELECT
                    public.in_person_game.id AS id,
                    public.in_person_game.player_one_id AS "playerOneId",
                    public.in_person_game.player_two_id AS "playerTwoId",
                    public.in_person_game.player_three_id AS "playerThreeId",
                    public.in_person_game.player_four_id AS "playerFourId",
                    public.in_person_game.player_one_score AS "playerOneScore",
                    public.in_person_game.player_two_score AS "playerTwoScore",
                    public.in_person_game.player_three_score AS "playerThreeScore",
                    public.in_person_game.player_four_score AS "playerFourScore",
                    public.in_person_game.notes
                FROM
                    public.in_person_game
                WHERE
                    public.in_person_game.guild_id = $1
                    AND public.in_person_game.date = $2::DATE
                    AND public.in_person_game.location = $3::"InPersonGameLocation";
            `,
            guildId,
            date,
            location
        )

        return inPersonGames
    }

    async readOnlineGame(guildId: bigint, id: number): Promise<OnlineGame> {
        const onlineGame = await this.#prisma.onlineGame.findFirst({ where: { guildId, id } })

        return onlineGame
    }

    async readOnlineGamesByDate(guildId: bigint, date: string): Promise<{ id: number, url: string }[]> {
        const onlineGames = await this.#prisma.$queryRawUnsafe<{ id: number, url: string }[]>(
            `
                SELECT
                    id,
                    url
                FROM
                    public.online_game
                WHERE
                    public.online_game.guild_id = $1
                    AND public.online_game.date = $2::DATE
            `,
            guildId,
            date
        )

        return onlineGames
    }

    async readTag(guildId: bigint, query: string): Promise<Tag> {
        const [tag] = await this.#prisma.$queryRawUnsafe<[Tag]>(
            `
                SELECT
                    *
                FROM
                    public.tag
                WHERE
                    public.tag.guild_id = $1
                    AND (
                        LOWER(public.tag.keyword) = $2
                        OR $2 = ANY(LOWER(public.tag.aliases::TEXT)::TEXT[])
                    )
                LIMIT 1;
            `,
            guildId,
            query.toLowerCase()      
        )
        
        return tag
    }

    async updateInPersonGame(guildId: bigint, id: number, data: InPersonGameUpdate): Promise<PartialInPersonGame> {
        let inPersonGame: PartialInPersonGame

        if ('date' in data)
            inPersonGame = await this.#prisma.$queryRawUnsafe<PartialInPersonGame>(
                `
                    UPDATE public.in_person_game
                    SET
                        date = $3::DATE
                    WHERE
                        public.in_person_game.guild_id = $1
                        AND public.in_person_game.id = $2
                    RETURNING
                        id,
                        player_one_id AS "playerOneId",
                        player_two_id AS "playerTwoId",
                        player_three_id AS "playerThreeId",
                        player_four_id AS "playerFourId",
                        player_one_score AS "playerOneScore",
                        player_two_score AS "playerTwoScore",
                        player_three_score AS "playerThreeScore",
                        player_four_score AS "playerFourScore",
                        notes;
                `,
                guildId,
                id,
                data.date
            )
        else {
            const players = Object.keys(data)
            const scores = Object.values(data)

            inPersonGame = await this.#prisma.inPersonGame.update({
                select: {
                    id: true,
                    playerOneId: true,
                    playerTwoId: true,
                    playerThreeId: true,
                    playerFourId: true,
                    playerOneScore: true,
                    playerTwoScore: true,
                    playerThreeScore: true,
                    playerFourScore: true,
                    notes: true
                },
                data: {
                    playerOneId: players[0],
                    playerTwoId: players[1],
                    playerThreeId: players[2],
                    playerFourId: players?.[3] ?? null,
                    playerOneScore: scores[0],
                    playerTwoScore: scores[1],
                    playerThreeScore: scores[2],
                    playerFourScore: scores?.[3] ?? null,
                },
                where: { guildId_id: { guildId, id } }
            })
        }
        
        return inPersonGame
    }

    async updateOnlineGame(guildId: bigint, id: number, data: RequireAtLeastOne<OnlineGame, 'date' | 'url'>): Promise<void> {
        const updates: string[] = []

        if (data?.date)
            updates.push(`date = '${ data.date }'::DATE`)
        if (data?.url)
            updates.push(`url = '${ data.url }'`)

        await this.#prisma.$queryRawUnsafe(
            `
                UPDATE public.online_game
                SET
                    ${ updates.join(',') }
                WHERE
                    public.online_game.guild_id = $1
                    AND public.online_game.id = $2;
            `,
            guildId,
            id
        )
    }

    async updateTag(guildId: bigint, keyword: string, data: RequireAtLeastOne<Tag, 'aliases' | 'content'>): Promise<Tag> {
        const tag = await this.#prisma.tag.update({ data, where: { guildId_keyword: { guildId, keyword } } })
    
        return tag
    }
}