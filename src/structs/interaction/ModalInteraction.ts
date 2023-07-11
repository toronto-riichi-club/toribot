import type { ModalInteractionOptions } from '#types/interaction'
import { BaseInteraction } from './BaseInteraction.js'
import type { APIModalSubmission } from '@discordjs/core'

export class ModalInteraction extends BaseInteraction {
    readonly data: APIModalSubmission
    readonly username: string

    public constructor({ data, username, ...baseOptions }: ModalInteractionOptions) {
        super(baseOptions)

        this.data = data
        this.username = username
    }

    public values(): [string, string][] {
        const entries = this.data.components.map(component => {
            const { custom_id, value } = component.components[0]

            return [custom_id, value] as [string, string]
        })

        return entries
    }
}