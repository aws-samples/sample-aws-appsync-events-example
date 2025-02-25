import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { app } from '../bin/infra';


// Add cdk-nag checks at the app level
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

