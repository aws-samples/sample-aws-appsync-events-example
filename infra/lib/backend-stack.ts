import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

interface BackendStackProps extends cdk.StackProps {
  user1Email: string;
  user1Name: string;
  user2Email?: string;
  user2Name?: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);


    // User Pool Resources
    const userPool = new cdk.aws_cognito.UserPool(this, 'AppSyncDemoUserPool', {
      selfSignUpEnabled: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireSymbols: true,
        requireDigits: true,
      },
      userVerification: {
        emailSubject: 'Verify your email for our AWS AppSync Event API Demo!',
        emailBody: 'Hello,\n\nPlease verify your email by using the following code: {####}\n\nThank you!',
        emailStyle: cdk.aws_cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: true, // Allow users to sign in using their username
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cdk.aws_cognito.UserPoolClient(this, 'AppSyncDemoUserPoolClient', {
      userPool,
    });

    const adminsGroup = new cdk.aws_cognito.UserPoolGroup(this, 'AdminsGroup', {
      userPool: userPool,
      groupName: 'admins',
      description: 'Used to authorize admin users to publish to admins namespace',
    });

    const user1 = new cdk.aws_cognito.CfnUserPoolUser(this, 'User1', {
      userPoolId: userPool.userPoolId,
      username: props.user1Name, // Use username instead of email
      userAttributes: [
        { name: 'email', value: props.user1Email },
        { name: 'email_verified', value: 'true' }
      ],
      desiredDeliveryMediums: ['EMAIL']
    });

    if (props.user2Name && props.user2Email) {
      new cdk.aws_cognito.CfnUserPoolUser(this, 'User2', {
        userPoolId: userPool.userPoolId,
        username: props.user2Name, // Use username instead of email
        userAttributes: [
          { name: 'email', value: props.user2Email },
          { name: 'email_verified', value: 'true' }
        ],
        desiredDeliveryMediums: ['EMAIL']
      });
    }

    new cdk.aws_cognito.CfnUserPoolUserToGroupAttachment(this, 'UserToGroupAttachment', {
      groupName: adminsGroup.groupName,
      username: user1.ref,
      userPoolId: userPool.userPoolId
    });



    const eventApi = new appsync.EventApi(this, 'EventsApi', {
      apiName: 'AppSyncEventsApiDemo',
      authorizationConfig: {
        authProviders: [
          {
            authorizationType: appsync.AppSyncAuthorizationType.USER_POOL,
            cognitoConfig: {
              userPool: userPool
            }
          }
        ],
      },
      logConfig: {
        fieldLogLevel: appsync.AppSyncFieldLogLevel.INFO,
        retention: logs.RetentionDays.ONE_WEEK
      }
    });

    eventApi.addChannelNamespace('default', {
      code: appsync.Code.fromAsset(path.join(__dirname, './eventHandlers/default.js')),
    })

    eventApi.addChannelNamespace('management');

    eventApi.addChannelNamespace('admins', {
      code: appsync.Code.fromAsset(path.join(__dirname, './eventHandlers/admins.js')),
    });

    eventApi.addChannelNamespace('users', {
      code: appsync.Code.fromAsset(path.join(__dirname, './eventHandlers/users.js')),
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
      value: userPoolClient.userPoolClientId
    });

    new cdk.CfnOutput(this, 'AppSyncApiEndpoint', {
      value: eventApi.httpDns
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region
    });
  }
}
