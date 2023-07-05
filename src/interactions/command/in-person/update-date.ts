import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
} from '@discordjs/core'
import dayjs from 'dayjs'

export const InPersonUpdateDateCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Update the date for an in-person game',
            name: 'update-date',
            options: [
                {
                    description: 'The in-person game to update',
                    name: 'id',
                    required: true,
                    type: ApplicationCommandOptionType.Number
                },
                {
                    description: 'The date (in "YYYY-MM-DD" format)',
                    name: 'date',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const id = interaction.getNumberOption('id')
        const date = interaction.getStringOption('date')
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        const inPersonGame = await client.database.readInPersonGame(interaction.guildId, id)

        if (!inPersonGame) 
            embed.description = 'No in-person game found.'
        else if (!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(date) || !dayjs(date, {}, true).isValid())
            embed.description = 'The provided date is not a valid date.'
        else {
            await client.database.updateInPersonGame(interaction.guildId, id, { date })

            const guildGames = client.cache.guilds.get(interaction.guildId).games
            const oldDate = dayjs(inPersonGame.date).format('YYYY-MM-DD')
            const count = await client.database.countInPersonGames(interaction.guildId, oldDate, inPersonGame.location)

            if (count === 0n)
                guildGames.remove(oldDate, inPersonGame.location)

            guildGames.insert(date, inPersonGame.location)

            embed.description = `Updated in-person game #${ id }!`
        }

        await interaction.updateReply({ embeds: [embed] })
    }
}