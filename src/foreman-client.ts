import axios, { AxiosInstance } from 'axios';

export interface ForemanConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export class ForemanClient {
  private client: AxiosInstance;
  private config: ForemanConfig;

  constructor(config: ForemanConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.baseUrl}/api/v2`,
      auth: {
        username: config.username,
        password: config.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Host Management
  async listHosts(params?: any) {
    const response = await this.client.get('/hosts', { params });
    return response.data;
  }

  async getHost(id: string) {
    const response = await this.client.get(`/hosts/${id}`);
    return response.data;
  }

  async createHost(hostData: any) {
    const response = await this.client.post('/hosts', { host: hostData });
    return response.data;
  }

  async updateHost(id: string, hostData: any) {
    const response = await this.client.put(`/hosts/${id}`, { host: hostData });
    return response.data;
  }

  async deleteHost(id: string) {
    const response = await this.client.delete(`/hosts/${id}`);
    return response.data;
  }

  async powerHost(id: string, powerAction: string) {
    const response = await this.client.put(`/hosts/${id}/power`, { 
      power_action: powerAction 
    });
    return response.data;
  }

  // Organization Management
  async listOrganizations(params?: any) {
    const response = await this.client.get('/organizations', { params });
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await this.client.get(`/organizations/${id}`);
    return response.data;
  }

  async createOrganization(orgData: any) {
    const response = await this.client.post('/organizations', { organization: orgData });
    return response.data;
  }

  async updateOrganization(id: string, orgData: any) {
    const response = await this.client.put(`/organizations/${id}`, { organization: orgData });
    return response.data;
  }

  async deleteOrganization(id: string) {
    const response = await this.client.delete(`/organizations/${id}`);
    return response.data;
  }

  // Content View Management
  async listContentViews(params?: any) {
    const response = await this.client.get('/content_views', { params });
    return response.data;
  }

  async getContentView(id: string) {
    const response = await this.client.get(`/content_views/${id}`);
    return response.data;
  }

  async createContentView(cvData: any) {
    const response = await this.client.post('/content_views', { content_view: cvData });
    return response.data;
  }

  async updateContentView(id: string, cvData: any) {
    const response = await this.client.put(`/content_views/${id}`, { content_view: cvData });
    return response.data;
  }

  async deleteContentView(id: string) {
    const response = await this.client.delete(`/content_views/${id}`);
    return response.data;
  }

  async publishContentView(id: string, description?: string) {
    const response = await this.client.post(`/content_views/${id}/publish`, { 
      description 
    });
    return response.data;
  }

  // Repository Management
  async listRepositories(params?: any) {
    const response = await this.client.get('/repositories', { params });
    return response.data;
  }

  async getRepository(id: string) {
    const response = await this.client.get(`/repositories/${id}`);
    return response.data;
  }

  async createRepository(repoData: any) {
    const response = await this.client.post('/repositories', { repository: repoData });
    return response.data;
  }

  async updateRepository(id: string, repoData: any) {
    const response = await this.client.put(`/repositories/${id}`, { repository: repoData });
    return response.data;
  }

  async deleteRepository(id: string) {
    const response = await this.client.delete(`/repositories/${id}`);
    return response.data;
  }

  async syncRepository(id: string) {
    const response = await this.client.post(`/repositories/${id}/sync`);
    return response.data;
  }

  // Activation Key Management
  async listActivationKeys(params?: any) {
    const response = await this.client.get('/activation_keys', { params });
    return response.data;
  }

  async getActivationKey(id: string) {
    const response = await this.client.get(`/activation_keys/${id}`);
    return response.data;
  }

  async createActivationKey(keyData: any) {
    const response = await this.client.post('/activation_keys', { activation_key: keyData });
    return response.data;
  }

  async updateActivationKey(id: string, keyData: any) {
    const response = await this.client.put(`/activation_keys/${id}`, { activation_key: keyData });
    return response.data;
  }

  async deleteActivationKey(id: string) {
    const response = await this.client.delete(`/activation_keys/${id}`);
    return response.data;
  }

  // Environment Management
  async listEnvironments(params?: any) {
    const response = await this.client.get('/environments', { params });
    return response.data;
  }

  async getEnvironment(id: string) {
    const response = await this.client.get(`/environments/${id}`);
    return response.data;
  }

  // Task Management
  async listTasks(params?: any) {
    const response = await this.client.get('/foreman_tasks/tasks', { params });
    return response.data;
  }

  async getTask(id: string) {
    const response = await this.client.get(`/foreman_tasks/tasks/${id}`);
    return response.data;
  }

  // Compute Resource Management
  async listComputeResources(params?: any) {
    const response = await this.client.get('/compute_resources', { params });
    return response.data;
  }

  async getComputeResource(id: string) {
    const response = await this.client.get(`/compute_resources/${id}`);
    return response.data;
  }

  async createComputeResource(resourceData: any) {
    const response = await this.client.post('/compute_resources', { compute_resource: resourceData });
    return response.data;
  }

  async updateComputeResource(id: string, resourceData: any) {
    const response = await this.client.put(`/compute_resources/${id}`, { compute_resource: resourceData });
    return response.data;
  }

  async deleteComputeResource(id: string) {
    const response = await this.client.delete(`/compute_resources/${id}`);
    return response.data;
  }

  async getComputeResourceAvailableImages(id: string) {
    const response = await this.client.get(`/compute_resources/${id}/available_images`);
    return response.data;
  }

  async getComputeResourceAvailableNetworks(id: string) {
    const response = await this.client.get(`/compute_resources/${id}/available_networks`);
    return response.data;
  }

  // Smart Proxy Management
  async listSmartProxies(params?: any) {
    const response = await this.client.get('/smart_proxies', { params });
    return response.data;
  }

  async getSmartProxy(id: string) {
    const response = await this.client.get(`/smart_proxies/${id}`);
    return response.data;
  }

  async createSmartProxy(proxyData: any) {
    const response = await this.client.post('/smart_proxies', { smart_proxy: proxyData });
    return response.data;
  }

  async updateSmartProxy(id: string, proxyData: any) {
    const response = await this.client.put(`/smart_proxies/${id}`, { smart_proxy: proxyData });
    return response.data;
  }

  async deleteSmartProxy(id: string) {
    const response = await this.client.delete(`/smart_proxies/${id}`);
    return response.data;
  }

  async refreshSmartProxy(id: string) {
    const response = await this.client.put(`/smart_proxies/${id}/refresh`);
    return response.data;
  }

  // Compute Profile Management
  async listComputeProfiles(params?: any) {
    const response = await this.client.get('/compute_profiles', { params });
    return response.data;
  }

  async getComputeProfile(id: string) {
    const response = await this.client.get(`/compute_profiles/${id}`);
    return response.data;
  }

  async createComputeProfile(profileData: any) {
    const response = await this.client.post('/compute_profiles', { compute_profile: profileData });
    return response.data;
  }

  async updateComputeProfile(id: string, profileData: any) {
    const response = await this.client.put(`/compute_profiles/${id}`, { compute_profile: profileData });
    return response.data;
  }

  async deleteComputeProfile(id: string) {
    const response = await this.client.delete(`/compute_profiles/${id}`);
    return response.data;
  }

  // Subnet Management
  async listSubnets(params?: any) {
    const response = await this.client.get('/subnets', { params });
    return response.data;
  }

  async getSubnet(id: string) {
    const response = await this.client.get(`/subnets/${id}`);
    return response.data;
  }

  async createSubnet(subnetData: any) {
    const response = await this.client.post('/subnets', { subnet: subnetData });
    return response.data;
  }

  async updateSubnet(id: string, subnetData: any) {
    const response = await this.client.put(`/subnets/${id}`, { subnet: subnetData });
    return response.data;
  }

  async deleteSubnet(id: string) {
    const response = await this.client.delete(`/subnets/${id}`);
    return response.data;
  }

  // Domain Management
  async listDomains(params?: any) {
    const response = await this.client.get('/domains', { params });
    return response.data;
  }

  async getDomain(id: string) {
    const response = await this.client.get(`/domains/${id}`);
    return response.data;
  }

  async createDomain(domainData: any) {
    const response = await this.client.post('/domains', { domain: domainData });
    return response.data;
  }

  async updateDomain(id: string, domainData: any) {
    const response = await this.client.put(`/domains/${id}`, { domain: domainData });
    return response.data;
  }

  async deleteDomain(id: string) {
    const response = await this.client.delete(`/domains/${id}`);
    return response.data;
  }

  // Generic request method for additional endpoints
  async request(method: string, path: string, data?: any, params?: any) {
    const response = await this.client.request({
      method,
      url: path,
      data,
      params
    });
    return response.data;
  }
}