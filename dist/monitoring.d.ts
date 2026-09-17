import { AWSClients } from './aws-clients';
/**
 * Wait for deployment to complete.
 * Returns the last seen event date to avoid duplicate events in subsequent monitoring.
 */
export declare function waitForDeploymentCompletion(clients: AWSClients, applicationName: string, environmentName: string, timeout: number, deploymentActionType?: 'create' | 'update', deploymentStartTime?: Date, expectedVersionLabel?: string): Promise<Date | undefined>;
/**
 * Wait for environment health to recover.
 */
export declare function waitForHealthRecovery(clients: AWSClients, applicationName: string, environmentName: string, timeout: number, deploymentStartTime?: Date, lastEventDateFromDeployment?: Date): Promise<void>;
/**
 * Wait for an existing environment to leave a transitional status (Updating/Launching) before
 * deploying to it. UpdateEnvironment on a non-Ready environment fails immediately with
 * "invalid state for this operation. Must be Ready", so a run that starts while a previous one is
 * still deploying (e.g. two pushes in quick succession) would otherwise fail after a few retries.
 * The status is read fresh here rather than reusing the pre-packaging check: packaging, upload,
 * or an image build may have taken long enough for another deployment to start in between.
 */
export declare function waitForEnvironmentReady(clients: AWSClients, applicationName: string, environmentName: string, timeout: number): Promise<void>;
/**
 * Get environment information for outputs.
 */
export declare function getEnvironmentInfo(clients: AWSClients, applicationName: string, environmentName: string): Promise<{
    url: string;
    id: string;
    status: string;
    health: string;
}>;
