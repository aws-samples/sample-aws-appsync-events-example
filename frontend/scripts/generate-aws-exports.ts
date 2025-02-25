import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import fs from 'fs';
import path from 'path';

const cf = new CloudFormationClient({ region: process.env.AWS_REGION });

async function generateAwsExports(): Promise<void> {
    const stackName: string = 'AppSyncDemoBackendStack'; // Replace with your actual stack name

    const command = new DescribeStacksCommand({ StackName: stackName });
    const { Stacks } = await cf.send(command);

    if (!Stacks || Stacks.length === 0) {
        throw new Error(`No stacks found for the name: ${stackName}`);
    }

    const outputs = Stacks[0].Outputs;

    const config = {
        Auth: {
            Cognito: {
                userPoolId: outputs?.find((o) => o.OutputKey === 'CognitoUserPoolId')?.OutputValue,
                userPoolClientId: outputs?.find((o) => o.OutputKey === 'CognitoUserPoolClientId')?.OutputValue,
            },
        },
        API: {
            Events: {
                endpoint: `https://${outputs?.find((o) => o.OutputKey === 'AppSyncApiEndpoint')?.OutputValue}/event`,
                region: outputs?.find((o) => o.OutputKey === 'Region')?.OutputValue,
                defaultAuthMode: "userPool"
            }
        }
    };

    const content = `import { ResourcesConfig } from "aws-amplify";\n\nexport const awsExports: ResourcesConfig = ${JSON.stringify(config, null, 2)};\n`;

    const filePath = path.join(__dirname, '../aws-exports.ts');

    fs.writeFileSync(filePath, content);
    console.log('aws-exports.ts has been generated successfully.');
}

generateAwsExports().catch(console.error);
