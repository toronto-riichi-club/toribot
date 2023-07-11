import type { AutocompleteFocusedOption, ChatInputCommandInteractionOptions } from '#types/interaction'
import {
    type APIApplicationCommandOptionChoice,
    type APIChatInputApplicationCommandInteractionData,
    type APIModalInteractionResponseCallbackData,
    InteractionResponseType,
    Routes
} from '@discordjs/core'
import { BaseInteraction } from './BaseInteraction.js'

export class ChatInputCommandInteraction extends BaseInteraction {
    readonly data: APIChatInputApplicationCommandInteractionData
    readonly username: string

    public constructor({ data, username, ...baseOptions }: ChatInputCommandInteractionOptions) {
        super(baseOptions)

        this.data = data
        this.username = username
    }

    public async autocomplete(choices: APIApplicationCommandOptionChoice<number | string>[]): Promise<void> {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data: {
                        choices
                    },
                    type: InteractionResponseType.ApplicationCommandAutocompleteResult
                }
            }
        )
    }

    public getFocusedOption<T extends AutocompleteFocusedOption>(): T {
        const option = this.data.options.find(o => ('focused' in o) && Boolean(o.focused)) as T

        return option
    }

    public async replyWithModal(data: APIModalInteractionResponseCallbackData): Promise<void> {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.Modal
                }
            }
        )
    }
}