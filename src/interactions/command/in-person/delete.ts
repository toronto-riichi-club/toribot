import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { GameLocation } from '#types/cache'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
} from '@discordjs/core'
import dayjs from 'dayjs'

export const InPersonDeleteCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Delete an in-person game',
            name: 'delete',
            options: [
                {
                    description: 'The in-person game to delete',
                    name: 'id',
                    required: true,
                    type: ApplicationCommandOptionType.Number
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const id = interaction.getNumberOption('id')
        const inPersonGame = await client.database.deleteInPersonGame(interaction.guildId, id)
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        if (!inPersonGame)
            embed.description = 'No in-person game found.'
        else {
            const date = dayjs(inPersonGame.date).format('YYYY-MM-DD')
            const count = await client.database.countInPersonGames(interaction.guildId, date, inPersonGame.location)

            if (count === 0n)
                client.cache.guilds.get(interaction.guildId).games.remove(date, inPersonGame.location as GameLocation)

            embed.description = `Deleted in-person game #${ id }!`
        }            

        await interaction.updateReply({ embeds: [embed] })
    }
}