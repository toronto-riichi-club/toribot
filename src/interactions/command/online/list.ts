import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
 } from '@discordjs/core'

export const OnlineListCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'List online games (by date)',
            name: 'list',
            options: [
                {
                    autocomplete: true,
                    description: 'The date to look for',
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

        const date = interaction.getStringOption('date')
        const onlineGames = await client.database.readOnlineGamesByDate(interaction.guildId, date)
        const embeds: Partial<APIEmbed>[] = [{ color: 0xF8F8FF, description: `${ onlineGames.length ? onlineGames.length : 'No' } online game(s) found for ${ date }.` }]
        
        if (onlineGames.length)
            embeds.push(
                ...Array
                    .from({ length: Math.ceil(onlineGames.length / 5) }, (_, i) => onlineGames.slice(5 * i, 5 * (i + 1)))
                    .map((onlineGameChunk, i ) => {
                        const description = onlineGameChunk
                            .map(onlineGame => `Game ${ onlineGame.id } - [Tenhou link](${ onlineGame.url })`)
                            .join('\n')
                        const title = `Game${ onlineGameChunk.length === 1 ? '' : 's' } ${ (5 * i) + 1}${ onlineGameChunk.length === 1 ? '' : ` - ${ (5 * i) + onlineGameChunk.length }` } (of ${ onlineGames.length }) for ${ date }`

                        return {
                            color: 0xF8F8FF,
                            description,
                            title
                        }
                    })
            )

        await interaction.updateReply({ embeds })
    }
}