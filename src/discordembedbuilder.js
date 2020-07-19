
// Discord embed bulilder seeing as eris doesn't specify that
// the webserver and thus the thing will be written in go(?)
// regardless, this just builds embeds and im not sure why
// im defining webserver behaviour here
class RichEmbed 
{

    constructor(e)
    {
        // defines that it's a richembed
        // which is all i'll be supporting
        // because nothing else is really needed lol
        this._type = 'rich';

        e.title ? this._title = e.title : this._title = 'Title Undefined';

    }

    get GetSendableObject()
    {
        return {
            title: this._title,
            type: this._type,
            description: "BRUH",
            // url: this._url,
            // timestamp: this._timestamp,
            // color: this._color,
            // footer: this._footer,
            // image: this._image,
            // thumbnail: this._thumbnail,
            // video: this._video,
            // provider: this._provider,
            // author: this._author,
            // fields: this._fields
        }
    }
}

module.exports = RichEmbed;
