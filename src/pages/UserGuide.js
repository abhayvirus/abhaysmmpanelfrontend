import React from 'react';
import UserLayout from '../components/UserLayout';
import GuidePage from '../components/GuidePage';
import {
  USER_GUIDE_META,
  USER_GUIDE_SECTIONS,
  USER_WORKFLOW_STEPS,
  USER_STATUS_FLOW,
  USER_QUICK_NAV,
  USER_UI_FEATURES,
} from '../content/userPanelGuide';

const UserGuide = () => (
  <UserLayout title="Help Guide">
    <GuidePage
      meta={USER_GUIDE_META}
      sections={USER_GUIDE_SECTIONS}
      workflowSteps={USER_WORKFLOW_STEPS}
      statusFlow={USER_STATUS_FLOW}
      quickNav={USER_QUICK_NAV}
      uiFeatures={USER_UI_FEATURES}
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      panelLabel="User panel navigation"
    />
  </UserLayout>
);

export default UserGuide;
