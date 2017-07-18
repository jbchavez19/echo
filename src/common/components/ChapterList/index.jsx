import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'

import ContentHeader from 'src/common/components/ContentHeader'
import ContentTable from 'src/common/components/ContentTable'

export default class ChapterList extends Component {
  render() {
    const {chapterData, chapterModel, allowCreate, onClickCreate} = this.props
    const header = (
      <ContentHeader
        title="Chapters"
        buttonIcon={allowCreate ? 'add_circle' : null}
        onClickButton={allowCreate ? onClickCreate : null}
        />
    )
    const content = chapterData.length > 0 ? (
      <ContentTable
        model={chapterModel}
        source={chapterData}
        />
    ) : (
      <div>No chapters yet.</div>
    )
    return (
      <div>
        <Helmet>
          <title>Chapters</title>
        </Helmet>
        {header}
        {content}
      </div>
    )
  }
}

ChapterList.propTypes = {
  chapterModel: PropTypes.object,
  chapterData: PropTypes.array,
  allowCreate: PropTypes.bool,
  onClickCreate: PropTypes.func,
}
