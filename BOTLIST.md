![Logori](https://cdn.discordapp.com/avatars/463829271933354006/6603c43051332030991f386fb484bbba.png?size=256)

# General Info

Logori is a logging bot designed to compliment the Audit Log with events that it does not log. Some audit log events are also available for the completeness (that's why the bot needs the `See Audit Log` permission).  

The prefix is `*`, but a mention will also work.

# Explanation

First of all, execute the command `*initserv` to initialize your server and put its event configuration in the database and set the current channel as the fallback channel. **Most commands will not work** before this command is executed.

>Note : The bot will not respond to the commands if you don't enter them correctly, or if you don't have the permissions to use them. This is intended to reduce possibility of spam by raiders or, eventually, by misconfigured user bots. The needed commands permissions are specified below.

Logori introduced the concept of "fallback event channels". Since you can do an in-depth customisation of the logging channel for each event, there should be a default channel for non-configured events to fall back too. This channel is set to the channel `initserv` is executed in, but you can modify it with the command `set-fallback-channel` in the channel you want.

The bot logs `events`. With Logori, you can choose which event you want to log and even customize the message and the channel where it is logged.  

Here is the list of currently available the events names (as of v2.2.1):

```
shameBan
pollrLikeBan
pollrLikeUnban
memberJoin
guildMemberAdd
memberLeft
guildMemberRemove
shameKick
pollrLikeKick
messageDelete
messageReactionAdd
messageReactionRemove
messageUpdate
```

## Customization of events

As said earlier, you can customize events as you want, with the command `*event`

### Enabling and disabling events

Use the command `*event eventName state enabled|disabled` by replacing, `eventName` with the actual event name, and **by choosing** one of `enabled` **or** `disabled`.

> Note: With the exception of events `memberJoin` and `memberLeft`, all events are **enabled** by default.

### Change per-event logging channel

For this, you can use the `event` command as follows `*event eventName channel`  

The logging channel will be set to the current channel, instructions will be given to you to explain how to revert back to the default channel.  
You can also mention a channel after that command to set the logging to that channel *remotely*.

### Change an event's message

A default message is set for all events. However, if you don't like it (which is likely), you are able to modify them as you want.  

To achieve that, you can do `*event eventName msg My awesome new message for this event`  

You may now ask how to include some event infos in that message. It's possible with a Quick Info™ label. Quick Info™ labels are codes specific for each event that will be replaced by the actual info when the log message is sent. They are specified in-depth for each event in the descriptions of the events below.  

But for example, if you need to display the name of a banned user when someone is banned, it would be `*event pollrLikeBan msg $banned has been banned.` where, in this event, `$banned` is a Quick Info™ label that will be replaced by the banned user's username and discriminator.

## Description of the events

### channelCreate

This event is triggered when a channel is created in the server.  

#### Labels

`$type` : The type of the created channel, either `voice` or `text`  
`$channelId` : The id of the created channel (you can mention the channel with this, with `<#$channelId>`)
`$channel` : The name of the channel created  
`$responsibleId` : The id of the member that created the channel.  
`$responsible` : The username then `#` then discriminator of the member that created the channel.  
`$reason` : The reason of the creation of the channel. If not, this is `null`.  
`$hastebin` : A more advanced log of what happened, a hastebin link.  

### channelDelete

This event is triggered when a channel is deleted in the server.  

#### Labels

`$type` : The type of the deleted channel, either `voice` or `text`  
`$channelId` : The id of the deleted channel.  
`$channel` : The name of the deleted channel.  
`$responsibleId` : The id of the member that deleted the channel.  
`$responsible` : The username then `#` then discriminator of the member that deleted the channel.  
`$reason` : The reason of the deletion of the channel. If not, this is `null`.  
`$hastebin` : A more advanced log of what happened, a hastebin link.  

### channelUpdate

This event is triggered when information about a channel have been updated.  

#### Labels

`$type` : The type of the updated channel, either `voice` or `text`  
`$oldChannel` : The old name of the channel.  
`$channelId` : The id of the updated channel.  
`$channel` : The new name of the channel.  
`$responsibleId` : The id of the member that updated the channel.  
`$responsible` : The username then `#` then discriminator of the member that updated the channel.  
`$reason` : The reason for the update of the channel. If not, this is `null`.  
`$hastebin` : A more advanced log of what happened, a hastebin link.  

### shameBan

This event is intended to be used as a "shame" message in the main channel of your server when a user is banned.  
It's triggered when a user is banned.  

#### Labels

`$bannedId` : The id of the banned user.
`$banned` : The username then `#` then discriminator of the banned user.  
`$channelId` : The id of the updated channel.
`$responsibleId` : The id of the member that banned the user.  
`$responsible` : The username then `#` then discriminator of the member that banned the user.  
`$reason` : The reason why the user has been banned. If not, this is `null`.  
`$case` : The "case" number of the "moderation action", starts at 1. For example, at the tenth ban (or kick or unban), this will be replaced by `10`.  
`$hastebin` : A more advanced log of what happened, a hastebin link.  

### pollrLikeBan

I don't know if you know the awesome Pollr bot. This event is intended, like Pollr, to display to everyone a public mod-log of what happened. This is, of course, just the intended use and you can use it how you want.  
This event is triggered when a user is banned.  

#### Labels

`$bannedId` : The id of the banned user.
`$banned` : The username then `#` then discriminator of the banned user.  
`$channelId` : The id of the updated channel.
`$responsibleId` : The id of the member that banned the user.  
`$responsible` : The username then `#` then discriminator of the member that banned the user.  
`$reason` : The reason why the user has been banned. If not, this is `null`.  
`$case` : The "case" number of the "moderation action", starts at 1. For example, at the tenth ban (or kick or unban), this will be replaced by `10`.  
`$hastebin` : A more advanced log of what happened, a hastebin link.  