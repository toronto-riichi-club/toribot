import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    ApplicationCommandOptionType,
    MessageFlags
} from '@discordjs/core'

export const TagDeleteCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption  {
        return {
            description: 'Delete a tag',
            name: 'delete',
            options: [
                {
                    autocomplete: true,
                    description: 'The tag to delete',
                    name: 'query',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const keyword = interaction.getStringOption('query')
        const tag = await client.database.deleteTag(interaction.guildId, keyword)
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        if (!tag)
            embed.description = 'No tag found.'
        else {
            client.cache.guilds.get(interaction.guildId).tags.remove(tag)
    
            embed.description = 'Deleted tag!'
        }
            
        await interaction.updateReply({ embeds: [embed] })
    }
}