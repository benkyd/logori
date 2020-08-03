const OffensiveWordsList = require('./ajds-wordslist.js').BlackList;

module.exports.ScoreMember = async function(erismember)
{
    // Higher score = higher trust factor

    // Warnings are an object
    // of at risk features of 
    // the member, ie 
    // {
    //      warning: "",
    //      severity: int // 0 low, 1 warn, 2 high, 3 action needed / severe
    // } 
    let ret = {
        score: 0,
        literalscore: '',
        warnings: []
    }

    // Bot clients automatically trusted due to admin
    // permission needed in order to invite them
    if (erismember.bot)
    {
        ret.score = 999;
        ret.warnins.push({warning:'member is bot', severity: 0});
        return ret;
    }

    // Account age -5-10 points
    // After 2 days of no increase, goes up 1 pt every 2 days of age
    // prior to 2 days, deduct 5 points
    let Age = new Date().getTime() - ((erismember.id >> 22 >>> 0) + 1420070400000);
    // age in days
    Age = Math.floor(Age / 1000 / 60 / 60 / 24);
    
    if (Age < 2)
    {
        ret.score -= 5;
        ret.warnings.push({warning: 'member account very new', severity: 2});
    } else 
    {
        let AgeScore = Math.min(Math.max(0, Age / 2 - 1), 10);
        if (AgeScore > 10) ret.warnings.push({warning: 'member account new', severity: 1});
        ret.score += AgeScore;
    }

    // Reward non-basic avatar
    if (erismember.avatar == null)
        ret.warnings.push({warning: 'member has basic avatar', severity: 1});
    else
        ret.score += 4;
    
    // TODO: proper non-basic colour distance alg

    // Penalize 4 letter usernames
    if (erismember.username.length == 4) ret.score -= 1;
    
    // Username profanity check
    // Inoffensive is +6 while offensive is -5 and severe warning
    let OffensiveWords = this.NickCheck(erismember.username);
    if (OffensiveWords.length == 0 || OffensiveWords == undefined) 
    {
        ret.score += 6;
    } else
    {
        for (OffensiveWord of OffensiveWords)
        {
            ret.warnings.push({warning: `members name contains offensive word: ${OffensiveWord}`, severity: 3});
        }
        ret.score -= 10;
    }

    // Time to score

    // perfect score is 20
    // worst score is -20

    if (ret.score >= 10)
        ret.literalscore = 'Members account is trustworthy'
    else if (ret.score >= 5)
        ret.literalscore = 'Members account is relatively trustworthy'
    else if (ret.score >= 0)
        ret.literalscore = 'Members account is most likely untrustworthy'
    else if (ret.score >= -6)
        ret.literalscore = 'Members account is untrustworthy'
    else
        ret.literalscore = 'Members account is untrustworthy and to be handled with great caution'

    return ret;

}

module.exports.NickCheck = function(name)
{
    // returns an array of every offensive word
    // included in the name provided
    let ret = [];
    
    name = name.toLowerCase();
    for (OffensiveWord of OffensiveWordsList)
        if (name.includes(OffensiveWord)) ret.push(OffensiveWord);

    return ret;
}
