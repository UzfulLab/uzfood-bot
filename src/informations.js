/** Draft of some code. Useless for now */
const token = process.env.SLACK_TOKEN

module.exports = {
  users: {
    setUsersInfo (bot) {
      bot.api.users.list({
        token: token
      }, function (err, res) {
        if (!err) {
          const members = res.members
          for (let member of members) {
            console.log(member.name)
          }
        }
      })
    },
    members (bot) {
      bot.api.users.list({
        token: token
      }, function (err, res) {
        if (!err) {
          const members = res.members
          console.log('\n\n\n\n')
          for (let member of members) {
            console.log(member.name)
            console.log(member.id)
            console.log(member.is_admin)
          }
          console.log('\n\n\n\n')
        }
      })
    },
    firstName (user) {

    }
  }
}
