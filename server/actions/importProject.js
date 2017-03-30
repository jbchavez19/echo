import logger from 'src/server/util/logger'
import findUsers from 'src/server/actions/findUsers'
import {getGoalInfo} from 'src/server/services/goalLibraryService'
import generateProjectName from 'src/server/actions/generateProjectName'
import initializeProject from 'src/server/actions/initializeProject'
import {Project} from 'src/server/services/dataService'
import {getChapter} from 'src/server/db/chapter'
import {getProject} from 'src/server/db/project'
import {getCycleForChapter} from 'src/server/db/cycle'
import {LGBadRequestError} from 'src/server/util/error'

export default async function importProject(data = {}, options = {}) {
  const {chapter, cycle, project, goal, players, coach} = await _parseProjectInput(data)

  const projectValues = {
    chapterId: chapter.id,
    cycleId: cycle.id,
  }
  if (goal) {
    projectValues.goal = goal
  }
  if (players) {
    projectValues.playerIds = players.map(p => p.id)
  }
  if (coach) {
    projectValues.coachId = coach.id
  }

  let savedProject
  if (project) {
    projectValues.id = project.id
    savedProject = await Project.get(project.id).update(projectValues)
  } else {
    projectValues.name = data.projectIdentifier || await generateProjectName()
    savedProject = await new Project(projectValues).save()
  }

  if (options.initializeChannel) {
    await initializeProject(savedProject, players)
  }

  logger.debug(`Project imported: #${savedProject.name} (${savedProject.id})`)

  return savedProject
}

async function _parseProjectInput(data) {
  const {
    projectIdentifier,
    chapterIdentifier,
    cycleIdentifier,
    goalIdentifier,
    playerIdentifiers = [],
    coachIdentifier,
  } = data || {}

  const userIdentifiers = [...playerIdentifiers]
  if (coachIdentifier) {
    userIdentifiers.push(coachIdentifier)
  }

  const [chapter, users] = await Promise.all([
    getChapter(chapterIdentifier),
    userIdentifiers.length > 0 ? findUsers(userIdentifiers, {idmFields: ['id', 'handle']}) : [],
  ])

  if (!chapter) {
    throw new LGBadRequestError(`Chapter not found for identifier ${chapterIdentifier}`)
  }

  const notFoundIds = userIdentifiers.filter(id => !users.find(u => (u.handle === id || u.id === id)))
  if (notFoundIds.length > 0) {
    throw new LGBadRequestError(`Users not found for identifiers: ${notFoundIds.join(', ')}`)
  }

  const players = playerIdentifiers.map(id => users.find(u => (u.handle === id || u.id === id)))
  const coach = users.find(u => (u.handle === coachIdentifier || u.id === coachIdentifier))

  const cycle = await getCycleForChapter(chapter.id, cycleIdentifier)
  if (!cycle) {
    throw new LGBadRequestError(`Cycle not found for identifier ${cycleIdentifier} in chapter ${chapterIdentifier}`)
  }
  if (cycle.chapterId !== chapter.id) {
    throw new LGBadRequestError(`Cycle ${cycleIdentifier} chapter ID ${cycle.chapterId} does not match chapter ${chapterIdentifier} ID ${chapter.id}`)
  }

  let project
  if (projectIdentifier) {
    project = await getProject(projectIdentifier)
    if (project) {
      if (project.chapterId !== chapter.id) {
        throw new LGBadRequestError(`Project ${projectIdentifier} chapter ID ${project.chapterId} does not match chapter ${chapterIdentifier} ID ${chapter.id}`)
      }
      if (project.cycleId !== cycle.id) {
        throw new LGBadRequestError(`Project ${projectIdentifier} cycle ID ${project.cycleId} does not match cycle ${cycleIdentifier} ID ${cycle.id}`)
      }
    }
  }

  let goal
  if (goalIdentifier && !goal) {
    const goalNumber = parseInt(goalIdentifier, 10)
    goal = await getGoalInfo(goalNumber)
    if (!goal) {
      throw new LGBadRequestError(`Goal not found with identifier: ${goalIdentifier}`)
    }
  }

  if (!project) {
    if (!goal) {
      throw new LGBadRequestError('New project imports must specify a goal')
    }
    if (!Array.isArray(playerIdentifiers) || playerIdentifiers.length === 0) {
      throw new LGBadRequestError('New project imports must specify at least one user')
    }
  }

  return {chapter, cycle, project, goal, players, coach}
}
