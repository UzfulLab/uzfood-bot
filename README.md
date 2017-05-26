# Uzfood-bot

#### A very nice robot based on botkit to inform you when it's time to order food !

***

## Setup
``` bash
# install dependencies
npm install

# served with hot reload. Also lunches eslint verification
npm run dev

# lunches eslint to check if code respects it's syntax
npm run eslint

# Creates documentation in out/ directory. Don't forget to `npm install -g jsdoc` before
npm run jsdoc
```

## Informations
This project uses eslint for its syntax. You should read [some documentation before ](http://eslint.org/docs/rules/)

The bot daily messages are sent to `#philippe` on debug mode and on `#_general` on production mode.

Yo need to set different environment variables:

``` bash
export SLACK_BOT_TOKEN="xoxb-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX"
export SLACK_HUMAN_TOKEN="xoxp-XXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

You'll find SLACK_HUMAN_TOKEN [here](https://api.slack.com/custom-integrations/legacy-tokens)

You'll find SLACK_BOT_TOKEN [here](https://uzful.slack.com/apps/A0F7YS25R-bots) (and select Philippe Etechbot)


## Useful resources
[Botkit documentation](https://github.com/howdyai/botkit/blob/master/docs/readme-slack.md)

[Slack events documentation](https://api.slack.com/events)

[Slack bot users documentation](https://api.slack.com/bot-users)


## Supported Commands
Just ask Philippe some `help` on direct message, he knows :)

## Production
No informations yet
