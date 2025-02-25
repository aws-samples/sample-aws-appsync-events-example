import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';


export class UiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // FrontEnd UI Resources
    const uiBucket = new s3.Bucket(this, 'UIBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const uiFilesPath = path.join(__dirname, '../../frontend/out');

    if (fs.existsSync(uiFilesPath)) {
      new s3deploy.BucketDeployment(this, 'DeployAsset', {
        sources: [s3deploy.Source.asset(uiFilesPath)],
        destinationBucket: uiBucket,
        destinationKeyPrefix: '/'
      });
    }


    const cloudFrontFunctionHandler = `function handler(event) {
      var request = event.request;
      var uri = request.uri;

      // Check if the URI ends with a slash and does not contain a file extension
      if (uri.endsWith('/') && !uri.includes('.')) {
          request.uri += 'index.html'; // Append index.html
      }

      return request;
    }`;

    const cfFunction = new cloudfront.Function(this, 'AppendIndexFunction', {
      code: cloudfront.FunctionCode.fromInline(cloudFrontFunctionHandler),
      autoPublish: true,
    })


    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(uiBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: cfFunction
          }
        ]
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ]
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'The domain name of the Distribution',
    });

  }
}
