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
    protected readonly applicationId: string
    readonly id: string
    protected readonly rest: REST
    protected readonly token: string

    public constructor({ applicationId, id, rest, token }: BaseInteractionOptions) {
        this.applicationId = applicationId
        this.id = id
        this.rest = rest
        this.token = token
    }

    public async defer({ ephemeral }: { ephemeral?: boolean } = { ephemeral: false }): Promise<void> {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
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

    public async reply({ ...data }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}): Promise<void> {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.ChannelMessageWithSource
                }
            }
        )
    }

    public async response(): Promise<APIMessage> {
        const message = await this.rest.get(Routes.webhookMessage(this.applicationId, this.token)) as APIMessage

        return message
    }

    public async updateReply({ ...body }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}): Promise<void> {
        await this.rest.patch(
            Routes.webhookMessage(this.applicationId, this.token),
            { auth: false, body }
        )
    }
}