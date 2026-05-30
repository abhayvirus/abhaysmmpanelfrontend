import React from 'react';
import AdminLayout from '../components/AdminLayout';
import GuidePage from '../components/GuidePage';
import {
  ADMIN_GUIDE_META,
  ADMIN_GUIDE_SECTIONS,
  ADMIN_WORKFLOW_STEPS,
  ADMIN_STATUS_FLOW,
  ADMIN_QUICK_NAV,
  ADMIN_UI_FEATURES,
} from '../content/adminPanelGuide';

const AdminGuide = () => (
  <AdminLayout>
    <GuidePage
      meta={ADMIN_GUIDE_META}
      sections={ADMIN_GUIDE_SECTIONS}
      workflowSteps={ADMIN_WORKFLOW_STEPS}
      statusFlow={ADMIN_STATUS_FLOW}
      quickNav={ADMIN_QUICK_NAV}
      uiFeatures={ADMIN_UI_FEATURES}
      backLink="/admin"
      backLabel="Back to Admin Dashboard"
      panelLabel="Admin panel navigation"
    />
  </AdminLayout>
);

export default AdminGuide;
