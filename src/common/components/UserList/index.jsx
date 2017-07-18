import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'

import ContentHeader from 'src/common/components/ContentHeader'
import ContentTable from 'src/common/components/ContentTable'

export default class UserList extends Component {
  render() {
    const {userData, userModel} = this.props
    const content = userData.length > 0 ? (
      <ContentTable
        model={userModel}
        source={userData}
        />
    ) : (
      <div>No user yet.</div>
    )

    return (
      <div>
        <Helmet>
          <title>Users</title>
        </Helmet>
        <ContentHeader title="Users"/>
        {content}
      </div>
    )
  }
}

UserList.propTypes = {
  userModel: PropTypes.object,
  userData: PropTypes.array,
}
