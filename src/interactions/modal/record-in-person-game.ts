import type { ModalSubmitInteraction, ToriClient } from '#structs'
import { GameBit, type ModalInteraction } from '#types/interaction'
import { type APIEmbed, MessageFlags } from '@discordjs/core'
import { InPersonGameLocation, InPersonGameType } from '@prisma/client'
import dayjs from 'dayjs'

export const RecordInPersonGameModal: ModalInteraction = {
    async handle(interaction: ModalSubmitInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        const values = Object.entries(interaction.values())
        const notes = values.pop()[1]
        const results: Record<string, number> = {}

        let totalScore = 0

        for (const [player, submittedScore] of values) {
            if (!/^((0|-?100,?000|-?([1-9]|[1-9]\d?,?\d)00)|(-?(0?\.[1-9]|100(\.0)?|([1-9]\d?(\.\d)?))k?))$/g.test(submittedScore)) {
                embed.description = 'One or more scores are in an invalid format. Please try again.'

                await interaction.updateReply({ embeds: [embed] })

                return  
            }

            let score = Number(submittedScore.replace(/[^0-9.]/g, ''))

            if (score % 100 !== 0)
                score = score * 1_000

            totalScore += score

            if (totalScore > 100_000) {
                embed.description = 'The total score exceeds 100,000 points. Please ensure that all scores sum to a maximum of 100,000 points.'

                await interaction.updateReply({ embeds: [embed] })

                return  
            }

            results[player] = score
        }

        const bits = Number(interaction.data.custom_id.split('-').at(-1))

        let location: InPersonGameLocation
        let type: InPersonGameType

        if (Boolean(bits & GameBit.Peel))
            location = InPersonGameLocation.PEEL
        if (Boolean(bits & GameBit.Toronto))
            location = InPersonGameLocation.TORONTO
        if (Boolean(bits & GameBit.Waterloo))
            location = InPersonGameLocation.WATERLOO
        if (Boolean(bits & GameBit.York))
            location = InPersonGameLocation.YORK

        if (Boolean(bits & GameBit.East))
            type = InPersonGameType.EAST
        if (Boolean(bits & GameBit.PotluckEast))
            type = InPersonGameType.POTLUCK_EAST
        if (Boolean(bits & GameBit.PotluckSouth))
            type = InPersonGameType.POTLUCK_SOUTH
        if (Boolean(bits & GameBit.SanmaEast))
            type = InPersonGameType.SANMA_EAST
        if (Boolean(bits & GameBit.SanmaSouth))
            type = InPersonGameType.SANMA_SOUTH
        if (Boolean(bits & GameBit.South))
            type = InPersonGameType.SOUTH
        if (Boolean(bits & GameBit.SpaceEast))
            type = InPersonGameType.SPACE_EAST
        if (Boolean(bits & GameBit.SpaceSouth))
            type = InPersonGameType.SPACE_SOUTH

        const inPersonGame = await client.database.insertInPersonGame(
            interaction.guildId,
            results,
            location,
            type,
            notes
        )
        const date = dayjs(inPersonGame.date).format('YYYY-MM-DD')

        client.cache.guilds.get(interaction.guildId).games.insert(date, location)
        embed.description = `Recorded in-person game #${ inPersonGame.id }!`
        
        await interaction.updateReply({ embeds: [embed] })
    }
}