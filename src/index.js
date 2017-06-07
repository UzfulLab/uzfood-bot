/**
 * @file Entry point of bot.
 * @author Kevin Leiba
 */

const responses = require('./responses.js')
const informations = require('./informations.js')

const config = require('../config.json')[process.env.NODE_ENV || 'development']
const schedule = require('node-schedule')
const pluralize = require('pluralize')
const entracteURL = 'https://docs.google.com/spreadsheets/d/1J_eVajvsbHEY5dzxzW1sJKuSA-XxA85Yi6VCSH0H2WY/edit#gid=375624052'
const uzfoodURL = 'https://docs.google.com/spreadsheets/d/1J_eVajvsbHEY5dzxzW1sJKuSA-XxA85Yi6VCSH0H2WY/edit#gid=1835906425'
const token = process.env.SLACK_BOT_TOKEN
const humanToken = process.env.SLACK_HUMAN_TOKEN

if (!token && !humanToken) {
  console.log('Error: Specify token in environment')
  process.exit(1)
}

let Botkit = require('Botkit')
// let os = require('os')

let controller = Botkit.slackbot({
  debug: config['DEBUG']
})

let bot = controller.spawn({
  token: token
}).startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  } else {
    console.log('PRET A TRAVAILLER !!')
  }
})

console.log(bot)

// Scheduler

/**
 * Sends a message every day at 11:00
 */
schedule.scheduleJob('0 0 11 * * *', function () {
  const text = 'Attention il ne reste plus qu’une demi heure pour faire ta commande sur foodcheri, à ton appli !'
  responses.messages.post(bot, text)
})

/**
 * Sends a message every wednesday at 10:30
 */
schedule.scheduleJob('0 30 10 * * 3', function () {
  const text = 'Viens voir le menu du jour à l’entracte et n’oublie pas de passer commande avant 11h:\n' + entracteURL
  responses.messages.post(bot, text)
})

/**
 * Sends a message every wednesday at 16:00
 */
schedule.scheduleJob('0 0 16 * * 3', function () {
  const text = 'Les inscriptions pour le uzfood de lundi sont ouvertes : inscrivez-vous jusqu’à vendredi 16h, et si on est trop nombreux il y aura un tirage au sort\n' + uzfoodURL
  responses.messages.post(bot, text)
})

/**
 * Sends a message every friday at 15:00
 */
schedule.scheduleJob('0 0 15 * * 5', function () {
  const text = 'Rappel, plus qu’une heure pour s’inscrire au uzfood de lundi:\n' + uzfoodURL
  responses.messages.post(bot, text)
})

controller.hears(['user list'], 'direct_message,direct_mention,mention', function (bot, message) {
  informations.users.members(bot)
  // console.log(users)
  bot.reply(message, 'regarde ta console')
})

/**
 * Explain the user how to use Philippe
 */
controller.hears(['aide', 'help'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.reply(message,
    'Hello ! Tu peux me passer commande si tu veux. Pour cela rien de plus simple:\n' +
    'Demande moi de `préparer une commande`, ou juste `une commande` tout en précisant dans combien de minutes tu veux ce soit:\n' +
    '`Prépare une commande pour dans 5 minutes philou`\n\n\n' +
    'Il suffit à tout le monde de répondre à ton propre message puis je ferai un récap de tout ce qui a été demandé :ok_hand:'
  )
})

/**
 * This function displays all the answers of a thread after a certain amount of minutes
 * @todo Display username after a command
 * @todo Make regex to be sure of what the user has wrote
 */
controller.hears(['prépare une commande', 'préparer une commande', 'une commande'], 'direct_mention,mention', function (bot, message) {
  const words = message.text.split(' ')
  let timer = 10
  for (const word of words) {
    if (Number(word)) {
      timer = Number(word)
      break
    }
  }
  setTimeout(function () {
    console.log('\n\n\n======\n')
    console.log(message.channel)
    console.log(message.ts)
    console.log('\n======\n\n\n')
    bot.api[config['CHANNEL_TYPE']].replies({
      token: humanToken,
      channel: message.channel,
      thread_ts: message.ts
    }, function (err, res) {
      if (!err) {
        console.log('\n\n\n\n\nPAS ERREUR' + res.messages[0].text)
        const messages = res.messages
        messages.shift()
        let answers = ''
        for (let message of messages) {
          answers += message.text + '\n'
        }
        bot.reply(message, 'DINGDONG ! C\'est l\'heure de commander !')
        bot.reply(message, answers)
      } else {
        console.log('\n\n\n\n\nERREUR', err)
        bot.reply(message, 'Désolé.... ya eu une erreur sur les commandes :/')
      }
    })
  }, timer * 60000)
  // }, 5000)
  bot.reply(message, 'Ok, j\'attends ' + pluralize('minute', timer, true) + ' puis je vous fais un recap de vos demandes. Pour faire ta commande, réponds au message juste au dessus en `thread`')
})

controller.hears(['bonjour', 'hey', 'salut', 'coucou'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.api.users.info({
    token: token,
    user: message.user
  }, function (err, res) {
    if (!err) {
      console.log('\n\n\n\n\n\n')
      console.log(message)
      const user = res.user
      const firstName = user.profile.first_name
      if (firstName) {
        bot.reply(message, 'Salut ' + firstName)
      } else {
        bot.reply(message, 'Salut ' + user.name)
      }
    }
  })
})

// Waiting for specific message
// controller.hears(['hello', 'hi', 'salut', 'coucou'], 'direct_message,direct_mention,mention', function (bot, message) {
//   bot.api.reactions.add({
//     timestamp: message.ts,
//     channel: message.channel,
//     name: 'wave'
//   }, function (err, res) {
//     if (err) {
//       bot.botkit.log('Failed to add emoji reaction :(', err)
//     }
//   })
//
//   controller.storage.users.get(message.user, function (err, user) {
//     if (!err) {
//       if (user && user.name) {
//         bot.reply(message, 'Coucou ' + user.name + '!!')
//       } else {
//         bot.reply(message, 'Comment ça va la vie ?')
//       }
//     }
//   })
// })

/**
 * Answers a basic question
 */
controller.hears(['ça va'], 'direct_message,direct_mention,mention', function (bot, message) {
  console.log('\n\n\n======message', message)
  console.log('\n\n\n======bot', bot)
  bot.reply(message, 'La patate')
})

/**
 * Answers a basic question
 */
controller.hears(['on mange quoi', 'manger'], 'direct_message,direct_mention,mention', function (bot, message) {
  bot.reply(message, 'Tu peux me passer une commande si tu veux ! Pour savoir comment faire, demmande moi de l\'aide')
})

/**
 * Uses emoji reactions
 */
controller.hears(['rep'], 'direct_message,direct_mention,mention', function (bot, message) {
  responses.reactions.rep(bot, message)
})

/*
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
*/
