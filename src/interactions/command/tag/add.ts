import type { ApplicationCommandInteraction } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIApplicationCommandOption,
    type APIModalInteractionResponseCallbackData,
    ApplicationCommandOptionType,
    ComponentType,
    TextInputStyle
} from '@discordjs/core'

export const TagAddCommand: CommandInteraction = {
    getCommand(): APIApplicationCommandOption  {
        return {
            description: 'Add a tag',
            name: 'add',
            type: ApplicationCommandOptionType.Subcommand
        }
    },
    async run(interaction: ApplicationCommandInteraction): Promise<void> {
        const modal: APIModalInteractionResponseCallbackData = {
            components: [
                {
                    components: [
                        {
                            custom_id: 'keyword',
                            label: 'Tag keyword',
                            max_length: 50,
                            placeholder: 'Tag keyword',
                            required: true,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput,
                            value: null
                        }
                    ],
                    type: ComponentType.ActionRow
                },
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
                            value: null
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
                            value: null
                        }
                    ],
                    type: ComponentType.ActionRow
                }
            ],
            custom_id: 'add-tag',
            title: 'Add tag'
        }

        await interaction.replyWithModal(modal)
    }
}