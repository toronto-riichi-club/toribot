import type { Tag } from '@prisma/client'

export class TagCache {
    #items: Set<string> = new Set()

    items() {
        return this.#items
    }

    insert(tag: Tag) {
        for (const phrase of [tag.keyword, ...tag.aliases])
            this.#items.add(phrase)
    }

    remove(tag: Tag) {
        for (const phrase of [tag.keyword, ...tag.aliases])
            this.#items.delete(phrase)
    }
}