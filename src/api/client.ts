import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class JoplinClient {
  private axiosInstance: AxiosInstance;
  private token: string;
  private verbose: boolean = false;

  constructor(token: string, baseURL: string = 'http://localhost:41184') {
    this.token = token;
    this.axiosInstance = axios.create({
      baseURL,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      if (this.verbose) {
        console.error(`[VERBOSE] ${config.method?.toUpperCase()} ${axios.getUri(config)}`);
        console.error(`[VERBOSE] PARAMS:`, JSON.stringify(config.params || {}, null, 2));
        if (config.data) {
          console.error('[VERBOSE] DATA:', JSON.stringify(config.data, null, 2));
        }
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.verbose) {
          console.error(`[VERBOSE] RESPONSE ${response.status}:`, JSON.stringify(response.data, null, 2));
        }
        return response;
      },
      (error) => {
        if (this.verbose) {
          if (error.response) {
            console.error(`[VERBOSE] RESPONSE ERROR ${error.response.status}:`, JSON.stringify(error.response.data, null, 2));
          } else {
            console.error('[VERBOSE] REQUEST ERROR:', error.message ? error.message : error);
          }
        }
        if (error.code === 'ECONNREFUSED') {
          return Promise.reject(new Error(`Failed to connect to Joplin API at ${this.axiosInstance.defaults.baseURL}. Please ensure the Joplin is running and the Web Clipper API is enabled.`));
        } else if (error.response.status === 403) {
          return Promise.reject(new Error('Invalid Joplin API token. Please check your token and try again.'));
        } else {
          return Promise.reject(error);
        }
      }
    );
  }

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  setToken(token: string) {
    this.token = token;
  }

  setBaseUrl(baseUrl: string) {
    this.axiosInstance.defaults.baseURL = baseUrl;
  }

  private getConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
    return {
      ...config,
      params: {
        token: this.token,
        ...config.params,
      },
    };
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, this.getConfig(config));
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, this.getConfig(config));
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, this.getConfig(config));
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.getConfig(config));
    return response.data;
  }
}
