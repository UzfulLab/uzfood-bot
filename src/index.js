let token = 'xoxb-186544031936-fqmXjxge1JODpcJw8Dzty9z8'

// var config = require('./config.json')[process.env.NODE_ENV || 'development']

if (!token) {
  console.log('Error: Specify token in environment')
  process.exit(1)
}

var Botkit = require('Botkit')
var os = require('os')

var controller = Botkit.slackbot({
  debug: true
})

var bot = controller.spawn({
  token: token
}).startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  } else {
    console.log('PRET A TRAVAILLER !!')
    // bot.api.chat.postMessage({
    //   'token': process.env.token,
    //   'channel': '#philippe',
    //   'text': 'Prêt à travailler',
    //   'as_user': true
    // })
  }
})

console.log(bot)

// Scheduler

// Waiting for specific message
controller.hears(['hello', 'hi', 'salut', 'coucou', 'bonjour'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'wave'
  }, function (err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err)
    }
  })

  controller.storage.users.get(message.user, function (err, user) {
    if (!err) {
      if (user && user.name) {
        bot.reply(message, 'Coucou ' + user.name + '!!')
      } else {
        bot.reply(message, 'Comment ça va la vie ?')
      }
    }
  })
})

controller.hears(['ça va'], 'direct_message,direct_mention,mention', function (bot, message) {
  console.log('\n\n\n======message', message)
  console.log('\n\n\n======bot', bot)
  bot.reply(message, 'G F1 srx')
})

controller.hears(['on mange quoi', 'manger'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.reply(message, 'KEBAB !!!')
})

controller.hears(['rep'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'registered'
  }, function (err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err)
    } else {
      bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'e-mail'
      }, function (err, res) {
        if (err) {
          bot.botkit.log('Failed to add emoji reaction :(', err)
        } else {
          bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'parking'
          }, function (err, res) {
            if (err) {
              bot.botkit.log('Failed to add emoji reaction :(', err)
            }
          })
        }
      })
    }
  })
})

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
  var name = message.match[1]
  controller.storage.users.get(message.user, function (err, user) {
    if (!err) {
      if (!user) {
        user = {
          id: message.user
        }
      }
    }
    user.name = name
    controller.storage.users.save(user, function (err, id) {
      if (!err) {
        bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.')
      }
    })
  })
})

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function (bot, message) {
  controller.storage.users.get(message.user, function (err, user) {
    if (err) {
      console.log(err)
    }
    if (user && user.name) {
      bot.reply(message, 'Your name is ' + user.name)
    } else {
      bot.startConversation(message, function (err, convo) {
        if (!err) {
          convo.say('I do not know your name yet!')
          convo.ask('What should I call you?', function (response, convo) {
            convo.ask('You want me to call you `' + response.text + '`?', [
              {
                pattern: 'yes',
                callback: function (response, convo) {
                  // since no further messages are queued after this,
                  // the conversation will end naturally with status == 'completed'
                  convo.next()
                }
              },
              {
                pattern: 'no',
                callback: function (response, convo) {
                  // stop the conversation. this will cause it to end with status == 'stopped'
                  convo.stop()
                }
              },
              {
                default: true,
                callback: function (response, convo) {
                  convo.repeat()
                  convo.next()
                }
              }
            ])

            convo.next()
          }, {'key': 'nickname'}) // store the results in a field called nickname

          convo.on('end', function (convo) {
            if (convo.status === 'completed') {
              bot.reply(message, 'OK! I will update my dossier...')

              controller.storage.users.get(message.user, function (err, user) {
                if (err) {
                  console.log(err)
                }
                if (!user) {
                  user = {
                    id: message.user
                  }
                }
                user.name = convo.extractResponse('nickname')
                controller.storage.users.save(user, function (err, id) {
                  if (err) {
                    console.log(err)
                  }
                  bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.')
                })
              })
            } else {
              // this happens if the conversation ended prematurely for some reason
              bot.reply(message, 'OK, nevermind!')
            }
          })
        }
      })
    }
  })
})

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    if (err) {
      console.log(err)
    }
    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function (response, convo) {
          convo.say('Bye!')
          convo.next()
          setTimeout(function () {
            process.exit()
          }, 3000)
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function (response, convo) {
          convo.say('*Phew!*')
          convo.next()
        }
      }
    ])
  })
})

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
'direct_message,direct_mention,mention', function (bot, message) {
  var hostname = os.hostname()
  var uptime = formatUptime(process.uptime())

  bot.reply(message,
    ':robot_face: I am a bot named <@' + bot.identity.name +
    '>. I have been running for ' + uptime + ' on ' + hostname + '.')
})

function formatUptime (uptime) {
  var unit = 'second'
  if (uptime > 60) {
    uptime = uptime / 60
    unit = 'minute'
  }
  if (uptime > 60) {
    uptime = uptime / 60
    unit = 'hour'
  }
  if (uptime !== 1) {
    unit = unit + 's'
  }

  uptime = uptime + ' ' + unit
  return uptime
}
