import { util } from '@aws-appsync/utils'

export function onPublish(ctx) {
    return ctx.events.map(event => ({
        id: event.id,
        payload: {
            ...event.payload,
            timestamp: util.time.nowISO8601()
        }
    }))
}