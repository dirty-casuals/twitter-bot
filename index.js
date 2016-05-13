(function() {
    var Twitter = require('twitter');
    var env = require('./env.js');
    var client;
    var userIds = '21565120';
    var trackTerms = '#testdev';

    var connect = function() {
        if(!process.env.TWITTER_CONSUMER_KEY) {
            throw new Error('Ensure that environment variables are setup');
        } 
        
        client = new Twitter({
              consumer_key: process.env.TWITTER_CONSUMER_KEY,
              consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
              access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
              access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        });
    }

    var stream = function() {
        client.stream('statuses/filter', {follow: userIds, track: trackTerms}, function(stream) {
            stream.on('data', function(tweet) {
                if(!tweet.favorited && !tweet.retweeted) {
                    client.post('statuses/retweet/' + tweet.id_str + '.json', {},  function(error, tweet, response){
                        if(error) {
                            console.log(error);
                        }
                    });
                }
            });

            stream.on('error', function(error) {
                throw error;
            });
        });
    }

    connect();
    stream();
})();
