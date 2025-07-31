import React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Header, Icons, useModal } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '../Toolbar/Toolbar';
import HeaderPatientInfo from './HeaderPatientInfo';
import { PatientInfoVisibility } from './HeaderPatientInfo/HeaderPatientInfo';
import { preserveQueryParameters } from '@ohif/app';
import { Types } from '@ohif/core';
import ChatPanel from '../Components/ChatPopup';

function ViewerHeader({ appConfig }: withAppTypes<{ appConfig: AppTypes.Config }>) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { servicesManager, extensionManager, commandsManager } = useSystem();
  const { customizationService } = servicesManager.services;

  const navigate = useNavigate();
  const location = useLocation();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  // Get patient ID from URL or other source
  const getPatientId = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('displaySetInstanceUID') || '873382992'; // fallback ID
  };

  // Get current user (doctor name) - you might want to get this from auth context or user service
  const getCurrentUser = () => {
    // Replace this with actual user retrieval logic
    // You might get this from servicesManager.services.userAuthenticationService or similar
    return 'mohit'; // or get from authentication context
  };

  const { t } = useTranslation();
  const { show } = useModal();

  const AboutModal = customizationService.getCustomization(
    'ohif.aboutModal'
  ) as Types.MenuComponentCustomization;

  const UserPreferencesModal = customizationService.getCustomization(
    'ohif.userPreferencesModal'
  ) as Types.MenuComponentCustomization;

  const menuOptions = [
    {
      title: AboutModal?.menuTitle ?? t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: AboutModal?.title ?? t('AboutModal:About OHIF Viewer'),
          containerClassName: AboutModal?.containerClassName ?? 'max-w-md',
        }),
    },
    {
      title: UserPreferencesModal.menuTitle ?? t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          content: UserPreferencesModal,
          title: UserPreferencesModal.title ?? t('UserPreferencesModal:User preferences'),
          containerClassName:
            UserPreferencesModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
        }),
    },
  ];

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }

  return (
    <>
      <Header
        menuOptions={menuOptions}
        isReturnEnabled={!!appConfig.showStudyList}
        onClickReturnButton={onClickReturnButton}
        WhiteLabeling={appConfig.whiteLabeling}
        Secondary={<Toolbar buttonSection="secondary" />}
        PatientInfo={
          appConfig.showPatientInfo !== PatientInfoVisibility.DISABLED && (
            <HeaderPatientInfo
              servicesManager={servicesManager}
              appConfig={appConfig}
            />
          )
        }
        UndoRedo={
          <div className="text-primary flex cursor-pointer items-center">
            <Button
              variant="ghost"
              className="hover:bg-primary-dark"
              onClick={() => {
                commandsManager.run('undo');
              }}
            >
              <Icons.Undo className="" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-primary-dark"
              onClick={() => {
                commandsManager.run('redo');
              }}
            >
              <Icons.Redo className="" />
            </Button>
            <Button
              variant="ghost"
              className={`hover:bg-primary-dark ${isChatOpen ? 'bg-primary-dark' : ''}`}
              onClick={() => {
                console.log('Chat button clicked!');
                setIsChatOpen(!isChatOpen);
              }}
            >
              <Icons.TabMessage className="" />
            </Button>
          </div>
        }
      >
        <div className="relative flex justify-center gap-[4px]">
          <Toolbar buttonSection="primary" />
        </div>
      </Header>

      {/* Chat Panel positioned absolutely */}
      {isChatOpen && (
        <div
          style={{
            position: 'fixed',
            top: '49px', // Adjust based on header height
            right: 0,
            height: 'calc(100vh - 60px)',
            zIndex: 1000,
            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          }}
        >
          <ChatPanel
            roomId={getPatientId()}
            user={getCurrentUser()}
          />
          {/* Close button for chat */}
          <button
            onClick={() => setIsChatOpen(false)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

export default ViewerHeader;
