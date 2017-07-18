export default function findProjects({page, identifiers} = {}) {
  return {
    variables: {page, identifiers},
    query: `
      query ($identifiers: [String], $page: ProjectPageInput) {
        findProjects(identifiers: $identifiers, page: $page) {
          id
          name
          memberIds
          phaseId
          artifactURL
          retrospectiveSurveyId
          createdAt
          updatedAt
          cycle {
            id
            cycleNumber
            state
          }
          goal {
            title
            url
          }
        }
      }
    `,
  }
}
