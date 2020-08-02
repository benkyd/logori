const WordsList = require('./ajds-wordslist.js').BlackList;

module.exports.ScoreMember = async function(erismember)
{
    // warnings are an object
    // of at risk features of 
    // the member, ie 
    // {
    //      warning: "",
    //      severity: int // 0 low, 1 warn, 2 high, 3 action needed
    // } 
    let ret = {
        score: 0,
        literalscore: '',
        warnings: []
    }

    if (erismember.bot)
    {
        ret.score = 50;
        warnins.push({warning:'member is bot', severity: 0});
        return ret;
    }



}
