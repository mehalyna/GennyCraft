/**
 * QuickActionsBar Usage Examples
 * 
 * Demonstrates various ways to use the QuickActionsBar component
 */

import React from 'react';
import QuickActionsBar from './QuickActionsBar';

// Example 1: Default actions
export const DefaultActionsExample = () => (
  <QuickActionsBar 
    onActionClick={(actionId: string) => console.log('Action clicked:', actionId)}
  />
);

// Example 2: Custom actions with React icons
export const CustomActionsExample = () => {
  const customIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const customActions = [
    { id: 'transfer', label: 'Transfer', icon: customIcon },
    { id: 'pay-bill', label: 'Pay Bill', icon: customIcon },
    { id: 'top-up', label: 'Top Up', icon: customIcon },
  ];

  return (
    <QuickActionsBar 
      actions={customActions}
      onActionClick={(actionId: string) => console.log('Custom action:', actionId)}
    />
  );
};

// Example 3: Integration with navigation
export const NavigationExample = () => {
  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'add-funds':
        window.location.href = '/add-funds';
        break;
      case 'send':
        window.location.href = '/send-money';
        break;
      case 'request':
        window.location.href = '/request-money';
        break;
      case 'history':
        window.location.href = '/transactions';
        break;
    }
  };

  return <QuickActionsBar onActionClick={handleActionClick} />;
};

// Example 4: With React Router
export const RouterIntegrationExample = () => {
  // Uncomment when using with react-router-dom
  // const navigate = useNavigate();

  const handleActionClick = (actionId: string) => {
    const routes: Record<string, string> = {
      'add-funds': '/wallet/add',
      'send': '/wallet/send',
      'request': '/wallet/request',
      'history': '/transactions',
    };

    // navigate(routes[actionId]);
    console.log('Navigate to:', routes[actionId]);
  };

  return <QuickActionsBar onActionClick={handleActionClick} />;
};

// Example 5: With modal triggers
export const ModalTriggerExample = () => {
  const [modalType, setModalType] = React.useState<string | null>(null);

  const handleActionClick = (actionId: string) => {
    setModalType(actionId);
    // Open modal based on actionId
  };

  return (
    <>
      <QuickActionsBar onActionClick={handleActionClick} />
      {modalType && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px' }}>
            <h2>{modalType} Modal</h2>
            <button onClick={() => setModalType(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

// Example 6: In Dashboard layout
export const DashboardLayoutExample = () => {
  const handleAction = (actionId: string) => {
    // Track analytics
    console.log('Quick action used:', actionId);
    
    // Handle action
    switch (actionId) {
      case 'add-funds':
        console.log('Opening add funds flow');
        break;
      case 'send':
        console.log('Opening send money flow');
        break;
      case 'request':
        console.log('Opening request money flow');
        break;
      case 'history':
        console.log('Opening transaction history');
        break;
    }
  };

  return (
    <div style={{ 
      maxWidth: '1024px', 
      margin: '0 auto', 
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <h1>My Wallet</h1>
      {/* Balance card would go here */}
      <QuickActionsBar onActionClick={handleAction} />
      {/* Recent transactions would go here */}
    </div>
  );
};

// Example 7: Two actions only
export const TwoActionsExample = () => {
  const limitedActions = [
    { 
      id: 'deposit', 
      label: 'Deposit', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      id: 'withdraw', 
      label: 'Withdraw', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
  ];

  return <QuickActionsBar actions={limitedActions} />;
};
