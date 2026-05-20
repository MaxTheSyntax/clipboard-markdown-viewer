import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import { FunctionUrlAuthType, HttpMethod, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import { notesStorage } from './storage/resource.js';
import { notesFunction } from './functions/notes/resource.js';

const backend = defineBackend({
  notesStorage,
  notesFunction,
});

const bucket = backend.notesStorage.resources.bucket;
const lambda = backend.notesFunction.resources.lambda;

bucket.grantReadWrite(lambda);
lambda.addEnvironment('NOTES_BUCKET_NAME', bucket.bucketName);

const fnUrl = lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  invokeMode: InvokeMode.BUFFERED,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.POST],
    allowedHeaders: ['content-type'],
    maxAge: Duration.seconds(86400),
  },
});

// Amplify's nested-stack wrapping can drop the implicit public-invoke grant
// that addFunctionUrl normally attaches for AuthType.NONE. Add it explicitly.
lambda.addPermission('AllowPublicFunctionUrlInvoke', {
  principal: new AnyPrincipal(),
  action: 'lambda:InvokeFunctionUrl',
  functionUrlAuthType: FunctionUrlAuthType.NONE,
});

backend.addOutput({
  custom: {
    notesApiUrl: fnUrl.url,
    notesBucketName: bucket.bucketName,
  },
});
