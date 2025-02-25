'use client';
import { useTranslation } from 'react-i18next';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Logout } from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

function TopBar() {

  const { t } = useTranslation();

  const {
    authStatus,
    signOut,
    user,
  } = useAuthenticator(context => [
    context.authStatus,
    context.signOut,
    context.user
  ]);

  const loginId = user?.signInDetails?.loginId;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>


          <Image
            src="/images/appsync.png" // Same logo for mobile
            alt="Logo"
            style={{ marginRight: '16px' }}
            width={40}
            height={40}
          />


          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
          >
            {t('root.topbar.title')}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>

          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {(authStatus == 'authenticated') && (
              <>
                <Box sx={{ display: { xs: 'none', md: 'inline-block' } }}>
                  {loginId}
                </Box>
                <Tooltip title="Logout">
                  <IconButton onClick={signOut} sx={{ marginLeft: '10px', p: 0 }}>
                    <Logout sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>


        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default TopBar;
