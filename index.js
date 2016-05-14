(function() {
    var Twit = require('twit');
    var winston = require('winston');
    var env = require('./env.js');
    var client;
    var userIds = '21565120';
    var trackTerms = ['#gamedev'];
    var logger;
    
    var setupLogger = function() {
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({ filename: 'bot_output.log' })
            ]
        });
    }

    var setupClient = function() {
        if(!process.env.TWITTER_CONSUMER_KEY) {
            throw new Error('Ensure that environment variables are setup');
        } 
        
        client = new Twit({
              consumer_key: process.env.TWITTER_CONSUMER_KEY,
              consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
              access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
              access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
    }
    
    var areAnyOfWordsInText = function(words, text) {
        var wordFound = false;
        for(var i = 0; i < words.length; i += 1) {
            var word = words[i].toLowerCase();
            if (text.indexOf(word) != -1){
                wordFound = true;
                break;
            }
        }

        return wordFound;
    }

    // this is a bit odd but it seems that using follow and track in the stream applies an OR not an AND. To
    // counter this we only follow users and then manually check the tweets for the hashtags
    var stream = function() {
        var stream = client.stream('statuses/filter', {follow: userIds});

        stream.on('tweet', function(tweet) {
            if(!tweet.favorited && !tweet.retweeted && !tweet.retweeted_status && areAnyOfWordsInText( trackTerms, tweet.text)) {
                logger.log('info', 'Retweeting tweet from %s with text %s', tweet.user.screen_name, tweet.text); 
                client.post('statuses/retweet/:id', {id: tweet.id_str},  function(error, tweet, response){
                    if(error) {
                        logger.log('error', error);
                    }
                });
            }
        });

        stream.on('error', function(error) {
            logger.log('error', error);
        });
    }

    setupLogger();
    setupClient();
    stream();
})();
