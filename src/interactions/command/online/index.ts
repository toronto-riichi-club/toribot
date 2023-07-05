import type { ApplicationCommandInteraction, ToriClient } from '#structs'
import type { CommandInteraction } from '#types/interaction'
import {
    type APIEmbed,
    ApplicationCommandType,
    MessageFlags,
    type RESTPostAPIApplicationCommandsJSONBody
} from '@discordjs/core'
import { OnlineDeleteCommand } from './delete.js'
import { OnlineListCommand } from './list.js'
import { OnlineRecordCommand } from './record.js'
import { OnlineUpdateCommand } from './update.js'

const enum OnlineCommandSubcommand {
    Delete = 'delete',
    List = 'list',
    Record = 'record',
    Update = 'update'
}

export const OnlineCommand: CommandInteraction = {
    getCommand(): RESTPostAPIApplicationCommandsJSONBody {
        return {
            description: 'Manage online games',
            name: 'online',
            options: [
                OnlineDeleteCommand.getCommand(),
                OnlineListCommand.getCommand(),
                OnlineRecordCommand.getCommand(),
                OnlineUpdateCommand.getCommand()
            ],
            type: ApplicationCommandType.ChatInput
        }
    },
    async run(interaction: ApplicationCommandInteraction, client: ToriClient): Promise<void> {
        if (((interaction.subcommand === OnlineCommandSubcommand.Delete) || (interaction.subcommand === OnlineCommandSubcommand.Update)) && !interaction.isInvokerAnAdmin()) {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'You must have administrator permissions to use this subcommand.' }

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        } else
            switch (interaction.subcommand) {
                case OnlineCommandSubcommand.Delete: return OnlineDeleteCommand.run(interaction, client)
                case OnlineCommandSubcommand.List: return OnlineListCommand.run(interaction, client)
                case OnlineCommandSubcommand.Record: return OnlineRecordCommand.run(interaction, client)
                case OnlineCommandSubcommand.Update: return OnlineUpdateCommand.run(interaction, client)
                default: {
                    const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'Unknown subcommand' }

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                }
            }
    }
}