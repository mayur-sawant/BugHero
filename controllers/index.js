const faker = require('faker')

const Issue = require('../models/Issue')
const Project = require('../models/Project')
const User = require('../models/User')
const Comment = require('../models/Comment')

module.exports = {
  index: async (req, res) => {
    const projects = await Project.find({ members: req.user.id })
    const projectsId = projects.map((project) => project._id)
    const issues = await Issue.find({ project: projectsId })

    const issuesByPriority = await Issue.aggregate([
      { $match: { project: { $in: projectsId } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])
    const issuesByType = await Issue.aggregate([
      { $match: { project: { $in: projectsId } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ])

    const issuesOpen = issues.filter((issue) => issue.status == 'Open').length
    const issuesClosed = issues.filter(
      (issue) => issue.status == 'Closed'
    ).length
    const projectsCount = await Project.find({ members: req.user.id }).count()
    const myProjects = await Project.find({ user: req.user }).count()

    res.render('dashboard', {
      issuesByPriority,
      issuesByType,
      projectsCount,
      issuesOpen,
      issuesClosed,
      myProjects,
    })
  },

  /* eslint-disable no-await-in-loop */
  generateFakeProject: async (req, res, next) => {
    for (let i = 0; i < 20; i += 1) {
      const project = new Project()

      project.user = await User.findOne()
      project.title = faker.commerce.productName()
      project.description = faker.commerce.productDescription()

      project.save((err) => {
        if (err) throw err
      })
    }
    res.redirect('/projects/1')
  },

  generateFakeComment: async (req, res, next) => {
    for (let i = 0; i < 20; i += 1) {
      const comment = new Comment()

      comment.user = await User.findOne()
      comment.issue = await Issue.findById('6110fa761d20aa57bd35342e')
      comment.comment = faker.commerce.productDescription()

      comment.save((err) => {
        if (err) throw err
      })
    }
    res.redirect('/projects/1')
  },
  /* eslint-disable no-await-in-loop */
}
