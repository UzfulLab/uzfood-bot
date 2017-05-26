/**
 * @file Helper of bot answers.
 * @author Kevin Leiba
 */

const config = require('../config.json')[process.env.NODE_ENV || 'development']
const token = process.env.SLACK_TOKEN

/**
 * Module to help lighter the code while sending a message. You can send messages or add reactions.
 * @module Bot reponses
 */
module.exports = {
  /**
   * Functions to post a message, an answer, etc...
   * @type {Object}
   */
  messages: {
    /**
     * This function posts a simple message to a defined channel
     * @param  {controller.spawn} bot  the instance of the bot
     * @param  {String} text The text to be sent
     */
    post (bot, text) {
      bot.api.chat.postMessage({
        'token': token,
        'channel': config['CHANNEL'],
        'text': text,
        'as_user': true
      })
    }
  },
  /**
   * Add emoji reactions to a message
   * @type {Object}
   */
  reactions: {
    /**
     * Reacts with :registered: :e-mail: :parking: emoji
     * @param  {controller.spwan} bot the instance of the bot
     * @param  {message} message message object received by the bot
     */
    rep (bot, message) {
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
    }
  }
}
