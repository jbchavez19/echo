import {connect} from 'src/db'
import {insertIntoTable, updateInTable, replaceInTable} from 'src/server/db/util'

import {customQueryError} from './errors'

const r = connect()
export const statsTable = r.table('stats')

export function saveStat(stat) {
  if (stat.id) {
    return replace(stat)
  }

  if (stat.descriptor) {
    return getStatByDescriptor(stat.descriptor)
      .then(existingStat =>
        update(
          Object.assign({}, {id: existingStat.id}, stat)
        )
      )
      .catch(() => insert(stat))
  }

  return insert(stat)
}

export function getStatByDescriptor(descriptor) {
  return statsTable.getAll(descriptor, {index: 'descriptor'})
    .nth(0)
    .default(customQueryError(`No Stat found with descriptor ${descriptor}`))
}

export function statsByDescriptor() {
  const addToResult = (result, stat) => result.merge(r.object(stat('descriptor'), stat))

  return statsTable.reduce((left, right) =>
    r.branch(
      left.hasFields('id').and(right.hasFields('id')),
      r.object(left('descriptor'), left, right('descriptor'), right),
      left.hasFields('id'),
      addToResult(right, left),
      right.hasFields('id'),
      addToResult(left, right),
      left.merge(right)
    )
  )
}

export function saveStats(stats) {
  return Promise.all(stats.map(
    stat => saveStat(stat)
  ))
}

export function getStatById(id) {
  return statsTable.get(id)
}

function update(stat, options) {
  return updateInTable(stat, statsTable, options)
}

function replace(stat, options) {
  return replaceInTable(stat, statsTable, options)
}

function insert(stat, options) {
  return insertIntoTable(stat, statsTable, options)
}