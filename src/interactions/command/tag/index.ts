import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIEmbed,
    ApplicationCommandType,
    MessageFlags,
    type RESTPostAPIApplicationCommandsJSONBody
} from '@discordjs/core'
import { TagAddCommand } from './add.js'
import { TagDeleteCommand } from './delete.js'
import { TagShowCommand } from './show.js'
import { TagUpdateCommand } from './update.js'

const enum TagCommandSubcommand {
    Add = 'add',
    Delete = 'delete',
    Show = 'show',
    Update = 'update'
}

export const TagCommand: CommandInteraction = {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            description: 'Manage tags',
            name: 'tag',
            options: [
                TagAddCommand.getCommand(),
                TagDeleteCommand.getCommand(),
                TagShowCommand.getCommand(),
                TagUpdateCommand.getCommand()
            ],
            type: ApplicationCommandType.ChatInput
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        if (interaction.subcommand !== TagCommandSubcommand.Show && !interaction.isInvokerAnAdmin()) {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'You must have administrator permissions to use this subcommand.' }

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        } else
            switch (interaction.subcommand) {
                case TagCommandSubcommand.Add: return TagAddCommand.run(interaction, client)
                case TagCommandSubcommand.Delete: return TagDeleteCommand.run(interaction, client)
                case TagCommandSubcommand.Show: return TagShowCommand.run(interaction, client)
                case TagCommandSubcommand.Update: return TagUpdateCommand.run(interaction, client)
                default: {
                    const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'Unknown subcommand' }

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                }
            }
    }
}