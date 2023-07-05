import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIEmbed,
    type APIModalInteractionResponseCallbackData,
    ApplicationCommandOptionType,
    ComponentType,
    TextInputStyle
} from '@discordjs/core'

export const TagUpdateCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption {
        return {
            description: 'Update a tag',
            name: 'update',
            options: [
                {
                    autocomplete: true,
                    description: 'The tag to update',
                    name: 'query',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        const query = interaction.getStringOption('query')
        const tag = await client.database.readTag(interaction.guildId, query) 

        if (!tag) {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'No tag found.' }

            await interaction.reply({ embeds: [embed] })
        } else {
            const modal: APIModalInteractionResponseCallbackData = {
                components: [
                    {
                        components: [
                            {
                                custom_id: 'aliases',
                                label: 'Tag aliases',
                                max_length: 100,
                                placeholder: 'Comma-separated list of tag aliases',
                                required: false,
                                style: TextInputStyle.Short,
                                type: ComponentType.TextInput,
                                value: tag.aliases.join(',')
                            }
                        ],
                        type: ComponentType.ActionRow
                    },
                    {
                        components: [
                            {
                                custom_id: 'content',
                                label: 'Tag content',
                                max_length: 1500,
                                placeholder: 'To ron, to riichi...',
                                required: true,
                                style: TextInputStyle.Paragraph,
                                type: ComponentType.TextInput,
                                value: tag.content
                            }
                        ],
                        type: ComponentType.ActionRow
                    }
                ],
                custom_id: `update-tag-${ tag.keyword }`,
                title: `Update "${ tag.keyword }" tag`
            }
    
            await interaction.replyWithModal(modal)
        }
    }
}