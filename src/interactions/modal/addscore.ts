import type { ModalInteraction, ToribotClient } from '#structs'
import type { Modal } from '#types/interaction'
import type { APIEmbed } from '@discordjs/core'
import type { GameLocation, GameType } from '@prisma/client'

export const AddScoreModal: Modal = {
    async handle(client: ToribotClient, interaction: ModalInteraction): Promise<void> {
        await interaction.defer()

        let embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        const values = interaction.values()
        const usernames: string[] = [interaction.username]
        const scores: number[] = []

        let totalScore = 0

        for (const [index, [username, submittedScore]] of values.entries()) {
            if ((index === 4) && !submittedScore?.length) {
                scores.push(0)
                continue
            }

            const prefix = (index === 4)
                ? 'The leftover points'
                : `The score for ${username}`

            if (!/^((0|-?100,?000|-?([1-9]|[1-9]\d?,?\d)00)|(-?(0?\.[1-9]|100(\.0)?|([1-9]\d?(\.\d)?))k?))$/g.test(submittedScore)) {
                embed.description = `${prefix} is in an invalid format.`

                await interaction.updateReply({ embeds: [embed] })
                return
            }

            if (index !== 4)
                usernames.push(username)

            const score = Number(submittedScore.replace(/[^0-9.]/g, '')) * 1_000

            scores.push(score)
            totalScore += score

            if (totalScore > 100_000) {
                embed.description = 'The total score exceeds 100,000 points. Please ensure that all scores sum to a maximum of 100,000 points.'

                await interaction.updateReply({ embeds: [embed] })
                return
            }
        }

        const [, location, type] = interaction.data.custom_id.split(':')
        const gameId = await client.database.games.insertGame(
            usernames[0],
            usernames[1],
            usernames[2],
            usernames[3],
            usernames[4],
            scores[0],
            scores[1],
            scores[2],
            scores[3],
            scores[4],
            location as GameLocation,
            type as GameType
        )

        embed = {
            ...embed,
            description: [0, 1, 2, 3]
                .map(index => {
                    const username = usernames[index + 1]
                    const cachedPlayer = client.cache.players.get(username)

                    return { score: scores[index], username: Boolean(cachedPlayer) ? `<@${cachedPlayer.toString()}>` : username }
                })
                .sort((a, b) => b.score - a.score)
                .map(({ score, username }) => `${username} - ${score}`)
                .join('\n'),
            fields: scores[4]
                ? [{ inline: false, name: 'Leftover points', value: scores[4].toString() }]
                : undefined,
            footer: { text: `Submitted by ${interaction.username}` },
            title: `Game #${gameId} (${type.toLowerCase()} at ${location.charAt(0).toUpperCase()}${location.slice(1).toLowerCase()})`
        }

        await interaction.updateReply({ embeds: [embed] })
    }
}