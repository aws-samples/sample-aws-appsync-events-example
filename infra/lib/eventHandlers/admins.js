import { util } from '@aws-appsync/utils'

export function onPublish(ctx) {
    if (ctx.identity.groups && ctx.identity.groups.includes('admins')) {
        return ctx.events.map(event => ({
            id: event.id,
            payload: {
                ...event.payload,
                timestamp: util.time.nowISO8601()
            }
        }))
    } else {
        util.unauthorized()
    }
}