import { ImageBuildConfiguration } from '@aws-sdk/client-elastic-beanstalk';
import { AWSClients } from './aws-clients';
/**
 * Maximum deployment package size in bytes (500 MB)
 * AWS Elastic Beanstalk limit: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/applications-sourcebundle.html
 */
export declare const MAX_DEPLOYMENT_PACKAGE_SIZE_BYTES: number;
/**
 * Keys of a user-supplied build-configuration object that the SDK does not model and therefore
 * silently drops from the CreateApplicationVersion request.
 */
export declare function unknownImageBuildConfigurationFields(config: object): string[];
/** Service default for ImageConfiguration.Build.TimeoutInMinutes when the caller doesn't set one. */
export declare const DEFAULT_IMAGE_BUILD_TIMEOUT_MINUTES = 60;
/** IAM role ARN in any partition (aws, aws-cn, aws-us-gov, ...), with an optional path. */
export declare const IAM_ROLE_ARN_PATTERN: RegExp;
export interface OptionSettingInput {
    Namespace?: string;
    OptionName?: string;
    Value?: string;
}
/**
 * Validate that option-settings contains required IAM roles when creating an environment
 */
export declare function validateOptionSettingsForCreate(optionSettingsJson: string | undefined): void;
/**
 * Validate that option-settings contains the settings the Beanstalk Cluster service itself requires
 * the customer to provide on CreateEnvironment (required=true with no default and no
 * server-side override in the service's option definitions): cluster-role, node-role, and
 * observability-role. Other required-flagged settings are satisfied without customer input
 * (operation-role is overridden server-side; service-port has a default), and
 * application-role is optional - so none of those are validated here.
 */
export declare function validateOptionSettingsForCreateClusterMode(optionSettingsJson: string | undefined): void;
/**
 * AWS S3 LocationConstraint regions
 * Used for S3 bucket creation outside of us-east-1
 */
export declare const AWS_S3_REGIONS: readonly ["af-south-1", "ap-east-1", "ap-northeast-1", "ap-northeast-2", "ap-northeast-3", "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "cn-north-1", "cn-northwest-1", "eu-central-1", "eu-north-1", "eu-south-1", "eu-west-1", "eu-west-2", "eu-west-3", "me-south-1", "sa-east-1", "us-east-2", "us-gov-east-1", "us-gov-west-1", "us-west-1", "us-west-2"];
export type AWSS3Region = typeof AWS_S3_REGIONS[number];
/**
 * Errors that retrying cannot fix: authorization/permission failures, expired or invalid
 * credentials, and deterministic Elastic Beanstalk rejections. Shared by retryWithBackoff and the
 * long-running pollers, which otherwise would keep retrying a permanent failure until their deadline.
 */
export declare function isNonRetryableError(error: unknown): boolean;
/**
 * Retry a function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number, retryDelay: number, operationName: string): Promise<T>;
/**
 * Get AWS account ID
 */
export declare function getAwsAccountId(clients: AWSClients, maxRetries: number, retryDelay: number): Promise<string>;
/**
 * Check if an application version exists
 */
export declare function applicationVersionExists(clients: AWSClients, applicationName: string, versionLabel: string): Promise<boolean>;
/**
 * Get the processing status of an application version (UNPROCESSED, BUILDING while an image builds, PROCESSED, FAILED).
 * Used to poll a Beanstalk Cluster image build to completion.
 */
export declare function getApplicationVersionStatus(clients: AWSClients, applicationName: string, versionLabel: string, maxRetries?: number, retryDelay?: number): Promise<string | undefined>;
/**
 * Describe an application version: the single DescribeApplicationVersions call behind
 * applicationVersionExists and getApplicationVersionStatus.
 */
export declare function getApplicationVersionInfo(clients: AWSClients, applicationName: string, versionLabel: string, maxRetries?: number, retryDelay?: number): Promise<{
    exists: boolean;
    status?: string;
    buildTimeoutMinutes?: number;
}>;
/**
 * Container image recorded on a Beanstalk Cluster application version (ImageSource.Uri),
 * or undefined when the version has none.
 */
export declare function getApplicationVersionImageUri(clients: AWSClients, applicationName: string, versionLabel: string, maxRetries: number, retryDelay: number): Promise<string | undefined>;
/**
 * Get S3 location for an existing version
 */
export declare function getVersionS3Location(clients: AWSClients, applicationName: string, versionLabel: string): Promise<{
    bucket: string;
    key: string;
}>;
/**
 * Check if an environment exists
 */
export declare function environmentExists(clients: AWSClients, applicationName: string, environmentName: string): Promise<{
    exists: boolean;
    status?: string;
    health?: string;
    tierName?: string;
}>;
/**
 * Upload deployment package to S3
 */
export declare function uploadToS3(clients: AWSClients, region: string, accountId: string, applicationName: string, versionLabel: string, packagePath: string, maxRetries: number, retryDelay: number, createBucketIfNotExists: boolean, customBucketName?: string): Promise<{
    bucket: string;
    key: string;
}>;
/**
 * Create S3 bucket if it does not exist
 */
export declare function createS3Bucket(clients: AWSClients, region: string, bucket: string, accountId: string, maxRetries: number, retryDelay: number): Promise<void>;
/**
 * Create an application version via the SDK.
 *
 * Beanstalk Standard versions carry a SourceBundle. Beanstalk Cluster versions carry an
 * ImageConfiguration: Source (a prebuilt image) or Build (built from the SourceBundle by the
 * service; Process=true starts the build).
 */
export declare function createApplicationVersion(clients: AWSClients, applicationName: string, versionLabel: string, s3Bucket: string | undefined, s3Key: string | undefined, maxRetries: number, retryDelay: number, autoCreateApplication: boolean, imageUri?: string, buildConfiguration?: ImageBuildConfiguration): Promise<void>;
/**
 * Update an existing environment
 */
export declare function updateEnvironment(clients: AWSClients, applicationName: string, environmentName: string, versionLabel: string, optionSettings: string | undefined, solutionStackName: string | undefined, platformArn: string | undefined, maxRetries: number, retryDelay: number): Promise<void>;
/**
 * Create a new environment. In Beanstalk Cluster mode the environment is created with
 * Tier={Name: Cluster, Type: EKS} instead of a solution stack or platform ARN.
 */
export declare function createEnvironment(clients: AWSClients, applicationName: string, environmentName: string, versionLabel: string, optionSettingsJson: string, solutionStackName: string | undefined, platformArn: string | undefined, cnamePrefix: string | undefined, maxRetries: number, retryDelay: number, isClusterMode?: boolean): Promise<void>;
export interface EnvironmentSnapshot {
    status?: string;
    health?: string;
    cname?: string;
    environmentId?: string;
    versionLabel?: string;
}
export interface EventSnapshot {
    severity?: string;
    message?: string;
    date?: Date;
}
/**
 * Describe an environment's current status/health for polling (used by monitoring.ts for both tiers).
 */
export declare function describeEnvironment(clients: AWSClients, applicationName: string, environmentName: string): Promise<EnvironmentSnapshot | null>;
/**
 * Describe an environment's recent events for polling (used by monitoring.ts for both tiers).
 */
export declare function describeEvents(clients: AWSClients, applicationName: string, environmentName: string): Promise<EventSnapshot[]>;
