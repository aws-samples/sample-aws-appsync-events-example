// AuthProvider.tsx
'use client';

import { awsExports } from '@/aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { ReactNode } from 'react';

Amplify.configure(awsExports);


interface AuthProviderProps {
    children: ReactNode; // Specify that children is of type ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    return (
        <Authenticator.Provider>
            {children}
        </Authenticator.Provider>
    );
};

export default AuthProvider;
