export interface SambaConfig {
  server: string;
  share: string;
  username: string;
  password: string;
  domain: string;
  port?: number;
}

export const sambaConfig: SambaConfig = {
  server: process.env.SAMBA_SERVER || '',
  share: process.env.SAMBA_SHARE || '',
  username: process.env.SAMBA_USERNAME || '',
  password: process.env.SAMBA_PASSWORD || '',
  domain: process.env.SAMBA_DOMAIN || 'WORKGROUP',
  port: parseInt(process.env.SAMBA_PORT || '445')
};

export const validateSambaConfig = (): boolean => {
  return !!(
    sambaConfig.server &&
    sambaConfig.share &&
    sambaConfig.username &&
    sambaConfig.password
  );
};