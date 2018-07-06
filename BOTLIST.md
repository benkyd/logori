![Logori](https://cdn.discordapp.com/avatars/463829271933354006/6603c43051332030991f386fb484bbba.png?size=256)

# General Info

Logori is a logging bot intended to complete the Audit Log with some event that it doesn't log. Some audit log events are also available for the completeness of the bot (that's why the bot needs `See Audit Log` permission).  

The command prefix is `*` but you can as well mention the bot.

# Explanation

First of all, execute the command `*initserv` to initialize your server and put its event configuration in the database and set the current channel as the fallback channel. **Most commands will not work** before that

>Note : The bot will not respond to the commands if you don't enter them correctly, or if you don't have the permissions to use them. This is intended to reduce possibility of spam by raiders or, eventually, by misconfigured user bots (those last are forbidden btw if you didn't know). The needed commands permissions are specified below.

With Logori there is a concept of "fallback event channel". Since you can customize in-depth the logging channel for each event, there should be a default channel for non-configured events. This channel is set to the current channel when executing `initserv` but you can modify it with the command `*set-fallback-channel` in the channel you want.

What the bot logs are called `events`. With Logori, you can choose which event you want to log and even customize the message and the channel where it is logged.  

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

Use the command `*event eventName state enabled|disabled` by replacing, of course, `eventName` with the actual event name, and **by choosing** one of `enabled` **or** `disabled` (| means or).

> Note: With the exception of events `memberJoin` and `memberLeft`, all events are **enabled** by default.

### Change per-event logging channel

For that, you can use the `event` command as follows `*event eventName channel`  

The logging channel will be set to the current channel, instructions will be given to you at that moment to explain how to revert back to the default channel.  
You can also mention a channel after that command to set the logging to that channel *remotely*.

### Change an event's message

A default message is set for all events. However, if you don't like it (which is likely), you are able to modify them as you want.  

To achieve that, you can do `*event eventName msg My awesome new message for this event`  

You may now ask how to include some event infos in that message. It's possible with a Quick Info™ label. Quick Info™ labels are codes specific for each event that will be replaced by the actual info when the log message is sent. They are specified in-depth for each event in the descriptions of the events below.  

But for example, if you need to display the name of a banned user when someone is banned, it would be `*event pollrLikeBan msg $banned has been banned.` where, in this event, `$banned` is a Quick Info™ label that will be replaced by the banned user's username and discriminator.

## Description of the events

### shameBan

This event is intended to be used. TO BE CONTINUED