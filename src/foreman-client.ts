import axios, { AxiosInstance } from 'axios';
import https from 'https';

export interface ForemanConfig {
  baseUrl: string;
  token: string;
}

export class ForemanClient {
  private client: AxiosInstance;
  private config: ForemanConfig;

  constructor(config: ForemanConfig) {
    this.config = config;
    
    // Create an HTTPS agent that ignores self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      httpsAgent: httpsAgent
    });
    
    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Cannot connect to Foreman at ${config.baseUrl}. Please check the URL and ensure Foreman is running.`);
        } else if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your Foreman API token.');
        } else if (error.response?.status === 404) {
          throw new Error(`API endpoint not found. Please check your Foreman version and API path.`);
        }
        throw error;
      }
    );
  }

  // Host Management
  async listHosts(params?: any) {
    const response = await this.client.get('/api/v2/hosts', { params });
    return response.data;
  }

  async getHost(id: string) {
    const response = await this.client.get(`/api/v2/hosts/${id}`);
    return response.data;
  }

  async createHost(hostData: any) {
    const response = await this.client.post('/api/v2/hosts', { host: hostData });
    return response.data;
  }

  async updateHost(id: string, hostData: any) {
    const response = await this.client.put(`/api/v2/hosts/${id}`, { host: hostData });
    return response.data;
  }

  async deleteHost(id: string) {
    const response = await this.client.delete(`/api/v2/hosts/${id}`);
    return response.data;
  }

  async powerHost(id: string, powerAction: string) {
    const response = await this.client.put(`/api/v2/hosts/${id}/power`, { 
      power_action: powerAction 
    });
    return response.data;
  }

  // Organization Management
  async listOrganizations(params?: any) {
    const response = await this.client.get('/api/v2/organizations', { params });
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await this.client.get(`/api/v2/organizations/${id}`);
    return response.data;
  }

  async createOrganization(orgData: any) {
    const response = await this.client.post('/api/v2/organizations', { organization: orgData });
    return response.data;
  }

  async updateOrganization(id: string, orgData: any) {
    const response = await this.client.put(`/api/v2/organizations/${id}`, { organization: orgData });
    return response.data;
  }

  async deleteOrganization(id: string) {
    const response = await this.client.delete(`/api/v2/organizations/${id}`);
    return response.data;
  }

  // Content View Management
  async listContentViews(params?: any) {
    const response = await this.client.get('/katello/api/content_views', { params });
    return response.data;
  }

  async getContentView(id: string) {
    const response = await this.client.get(`/katello/api/content_views/${id}`);
    return response.data;
  }

  async createContentView(cvData: any) {
    const response = await this.client.post('/katello/api/content_views', cvData);
    return response.data;
  }

  async updateContentView(id: string, cvData: any) {
    const response = await this.client.put(`/katello/api/content_views/${id}`, cvData);
    return response.data;
  }

  async deleteContentView(id: string) {
    const response = await this.client.delete(`/katello/api/content_views/${id}`);
    return response.data;
  }

  async publishContentView(id: string, description?: string) {
    const response = await this.client.post(`/katello/api/content_views/${id}/publish`, { 
      description 
    });
    return response.data;
  }

  // Product Management
  async listProducts(params?: any) {
    const response = await this.client.get('/katello/api/products', { params });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/katello/api/products/${id}`);
    return response.data;
  }

  async createProduct(productData: any) {
    const response = await this.client.post('/katello/api/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: any) {
    const response = await this.client.put(`/katello/api/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.client.delete(`/katello/api/products/${id}`);
    return response.data;
  }

  async syncProduct(id: string) {
    const response = await this.client.post(`/katello/api/products/${id}/sync`);
    return response.data;
  }

  // Repository Management
  async listRepositories(params?: any) {
    const response = await this.client.get('/katello/api/repositories', { params });
    return response.data;
  }

  async getRepository(id: string) {
    const response = await this.client.get(`/katello/api/repositories/${id}`);
    return response.data;
  }

  async createRepository(repoData: any) {
    const response = await this.client.post('/katello/api/repositories', repoData);
    return response.data;
  }

  async updateRepository(id: string, repoData: any) {
    const response = await this.client.put(`/katello/api/repositories/${id}`, repoData);
    return response.data;
  }

  async deleteRepository(id: string) {
    const response = await this.client.delete(`/katello/api/repositories/${id}`);
    return response.data;
  }

  async syncRepository(id: string) {
    const response = await this.client.post(`/katello/api/repositories/${id}/sync`);
    return response.data;
  }

  // Activation Key Management
  async listActivationKeys(params?: any) {
    const response = await this.client.get('/katello/api/activation_keys', { params });
    return response.data;
  }

  async getActivationKey(id: string) {
    const response = await this.client.get(`/katello/api/activation_keys/${id}`);
    return response.data;
  }

  async createActivationKey(keyData: any) {
    const response = await this.client.post('/katello/api/activation_keys', keyData);
    return response.data;
  }

  async updateActivationKey(id: string, keyData: any) {
    const response = await this.client.put(`/katello/api/activation_keys/${id}`, keyData);
    return response.data;
  }

  async deleteActivationKey(id: string) {
    const response = await this.client.delete(`/katello/api/activation_keys/${id}`);
    return response.data;
  }

  // Environment Management
  async listEnvironments(params?: any) {
    const response = await this.client.get('/api/v2/environments', { params });
    return response.data;
  }

  async getEnvironment(id: string) {
    const response = await this.client.get(`/api/v2/environments/${id}`);
    return response.data;
  }

  // Host Group Management
  async listHostGroups(params?: any) {
    const response = await this.client.get('/api/v2/hostgroups', { params });
    return response.data;
  }

  async getHostGroup(id: string) {
    const response = await this.client.get(`/api/v2/hostgroups/${id}`);
    return response.data;
  }

  async createHostGroup(hostgroupData: any) {
    const response = await this.client.post('/api/v2/hostgroups', { hostgroup: hostgroupData });
    return response.data;
  }

  async updateHostGroup(id: string, hostgroupData: any) {
    const response = await this.client.put(`/api/v2/hostgroups/${id}`, { hostgroup: hostgroupData });
    return response.data;
  }

  async deleteHostGroup(id: string) {
    const response = await this.client.delete(`/api/v2/hostgroups/${id}`);
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
    const response = await this.client.get('/api/v2/compute_resources', { params });
    return response.data;
  }

  async getComputeResource(id: string) {
    const response = await this.client.get(`/api/v2/compute_resources/${id}`);
    return response.data;
  }

  async createComputeResource(resourceData: any) {
    const response = await this.client.post('/api/v2/compute_resources', { compute_resource: resourceData });
    return response.data;
  }

  async updateComputeResource(id: string, resourceData: any) {
    const response = await this.client.put(`/api/v2/compute_resources/${id}`, { compute_resource: resourceData });
    return response.data;
  }

  async deleteComputeResource(id: string) {
    const response = await this.client.delete(`/api/v2/compute_resources/${id}`);
    return response.data;
  }

  async getComputeResourceAvailableImages(id: string) {
    const response = await this.client.get(`/api/v2/compute_resources/${id}/available_images`);
    return response.data;
  }

  async getComputeResourceAvailableNetworks(id: string) {
    const response = await this.client.get(`/api/v2/compute_resources/${id}/available_networks`);
    return response.data;
  }

  // Smart Proxy Management
  async listSmartProxies(params?: any) {
    const response = await this.client.get('/api/v2/smart_proxies', { params });
    return response.data;
  }

  async getSmartProxy(id: string) {
    const response = await this.client.get(`/api/v2/smart_proxies/${id}`);
    return response.data;
  }

  async createSmartProxy(proxyData: any) {
    const response = await this.client.post('/api/v2/smart_proxies', { smart_proxy: proxyData });
    return response.data;
  }

  async updateSmartProxy(id: string, proxyData: any) {
    const response = await this.client.put(`/api/v2/smart_proxies/${id}`, { smart_proxy: proxyData });
    return response.data;
  }

  async deleteSmartProxy(id: string) {
    const response = await this.client.delete(`/api/v2/smart_proxies/${id}`);
    return response.data;
  }

  async refreshSmartProxy(id: string) {
    const response = await this.client.put(`/api/v2/smart_proxies/${id}/refresh`);
    return response.data;
  }

  // Compute Profile Management
  async listComputeProfiles(params?: any) {
    const response = await this.client.get('/api/v2/compute_profiles', { params });
    return response.data;
  }

  async getComputeProfile(id: string) {
    const response = await this.client.get(`/api/v2/compute_profiles/${id}`);
    return response.data;
  }

  async createComputeProfile(profileData: any) {
    const response = await this.client.post('/api/v2/compute_profiles', { compute_profile: profileData });
    return response.data;
  }

  async updateComputeProfile(id: string, profileData: any) {
    const response = await this.client.put(`/api/v2/compute_profiles/${id}`, { compute_profile: profileData });
    return response.data;
  }

  async deleteComputeProfile(id: string) {
    const response = await this.client.delete(`/api/v2/compute_profiles/${id}`);
    return response.data;
  }

  // Subnet Management
  async listSubnets(params?: any) {
    const response = await this.client.get('/api/v2/subnets', { params });
    return response.data;
  }

  async getSubnet(id: string) {
    const response = await this.client.get(`/api/v2/subnets/${id}`);
    return response.data;
  }

  async createSubnet(subnetData: any) {
    const response = await this.client.post('/api/v2/subnets', { subnet: subnetData });
    return response.data;
  }

  async updateSubnet(id: string, subnetData: any) {
    const response = await this.client.put(`/api/v2/subnets/${id}`, { subnet: subnetData });
    return response.data;
  }

  async deleteSubnet(id: string) {
    const response = await this.client.delete(`/api/v2/subnets/${id}`);
    return response.data;
  }

  // Domain Management
  async listDomains(params?: any) {
    const response = await this.client.get('/api/v2/domains', { params });
    return response.data;
  }

  async getDomain(id: string) {
    const response = await this.client.get(`/api/v2/domains/${id}`);
    return response.data;
  }

  async createDomain(domainData: any) {
    const response = await this.client.post('/api/v2/domains', { domain: domainData });
    return response.data;
  }

  async updateDomain(id: string, domainData: any) {
    const response = await this.client.put(`/api/v2/domains/${id}`, { domain: domainData });
    return response.data;
  }

  async deleteDomain(id: string) {
    const response = await this.client.delete(`/api/v2/domains/${id}`);
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