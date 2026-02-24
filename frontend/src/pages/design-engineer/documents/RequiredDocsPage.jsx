import React from 'react';
import DocumentSelector from '../../../components/design-engineer/DocumentSelector';

const RequiredDocsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DocumentSelector 
          documentType="required-documents"
          title="Required Documents"
          description="Access all required technical documents and specifications uploaded for your assigned root cards"
        />
      </div>
    </div>
  );
};

export default RequiredDocsPage;
