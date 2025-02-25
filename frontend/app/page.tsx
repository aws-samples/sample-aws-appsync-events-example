"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBar from "./components/TopBar";


export default function Home() {

  const router = useRouter();
  const { authStatus } = useAuthenticator(context => [context.authStatus]);


  useEffect(() => {

    if (authStatus == 'authenticated') {
      router.push('/channels/')
      return;
    }
  }, [authStatus, router])

  return (
    <>
      <TopBar />
      <Box sx={{ paddingTop: '100px' }}>
        <Authenticator hideSignUp={true}>
        </Authenticator>
      </Box>
    </>
  );
}
