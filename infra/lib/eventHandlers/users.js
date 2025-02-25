import { util } from '@aws-appsync/utils'

export function onSubscribe(ctx) {
    if (ctx.info.channel.path !== `/users/${ctx.identity.username}`) {
        console.log(`user ${ctx.identity.username} tried connecting to wrong channel: ${ctx.channel}`)
        util.unauthorized()
    }
}

export function onPublish(ctx) {
    if (ctx.info.channel.path == `/users/${ctx.identity.username}`) {
        return ctx.events.map(event => ({
            id: event.id,
            payload: {
                ...event.payload,
                timestamp: util.time.nowISO8601()
            }
        }))
    } else {
        console.log(`user ${ctx.identity.username} tried to publish to wrong channel: ${ctx.channel}`)
        util.unauthorized()
    }
}