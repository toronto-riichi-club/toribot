import type { BaseInteractionOptions } from '#types/interaction'
import {
    type APIMessage,
    type APIInteractionResponseCallbackData,
    InteractionResponseType,
    MessageFlags,
    Routes
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export class BaseInteraction {
    #applicationId: string
    #id: string
    #rest: REST
    #token: string

    constructor({ applicationId, id, rest, token }: BaseInteractionOptions) {
        this.#applicationId = applicationId
        this.#id = id
        this.#rest = rest
        this.#token = token
    }

    get id() {
        return this.#id
    }

    get rest() {
        return this.#rest
    }

    get token() {
        return this.#token
    }

    async defer({ ephemeral }: { ephemeral?: boolean } = { ephemeral: false }): Promise<void> {
        await this.#rest.post(
            Routes.interactionCallback(this.#id, this.#token),
            {
                auth: false,
                body: {
                    data: {
                        flags: ephemeral ? MessageFlags.Ephemeral : undefined
                    },
                    type: InteractionResponseType.DeferredChannelMessageWithSource
                }
            }
        )
    }

    async reply({ ...data }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}): Promise<void> {
        await this.#rest.post(
            Routes.interactionCallback(this.#id, this.#token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.ChannelMessageWithSource
                }
            }
        )
    }

    async response(): Promise<APIMessage> {
        const message = await this.#rest.get(Routes.webhookMessage(this.#applicationId, this.#token)) as APIMessage

        return message
    }

    async updateReply({ ...body }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}): Promise<void> {
        await this.#rest.patch(
            Routes.webhookMessage(this.#applicationId, this.#token),
            {
                auth: false,
                body
            }
        )
    }
}