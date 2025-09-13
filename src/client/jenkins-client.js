/**
 * Jenkins Client - Handles authentication and CSRF token management
 */

import axios from "axios";
import config from "../config/index.js";

export class JenkinsClient {
	constructor(baseUrl, username, apiToken) {
		this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
		this.auth =
			username && apiToken ? { username, password: apiToken } : null;

		this.axios = axios.create({
			baseURL: this.baseUrl,
			auth: this.auth,
			headers: { "Content-Type": "application/json" },
			validateStatus: (status) => status < 500,
			timeout: config.tools?.defaultTimeout || 30000,
		});

		this.crumb = null;
		this.crumbFetchedAt = 0;
		this.crumbTtlMs = 5 * 60 * 1000; // 5 minutes
		this.maxRetries = config.tools?.retries || 0;

		// Response interceptor for retry on network related issues (ENOTFOUND, ECONNRESET, 502/503/504)
		this.axios.interceptors.response.use(
			(res) => res,
			async (error) => {
				const cfg = error.config;
				if (!cfg || cfg.__retryCount === undefined)
					return Promise.reject(error);
				const retriableStatus = [502, 503, 504];
				const networkError = !error.response;
				if (
					cfg.__retryCount < this.maxRetries &&
					(networkError ||
						retriableStatus.includes(error.response?.status))
				) {
					cfg.__retryCount++;
					const delay = Math.min(
						1000 * Math.pow(2, cfg.__retryCount),
						8000
					);
					await new Promise((r) => setTimeout(r, delay));
					return this.axios(cfg);
				}
				return Promise.reject(error);
			}
		);
	}

	/**
	 * Get CSRF crumb for authentication
	 */
	async getCrumb(force = false) {
		const now = Date.now();
		if (
			!force &&
			this.crumb &&
			now - this.crumbFetchedAt < this.crumbTtlMs
		) {
			return this.crumb;
		}
		try {
			const response = await this.axios.get("/crumbIssuer/api/json", {
				__retryCount: 0,
			});
			if (response.status === 200 && response.data) {
				this.crumb = {
					[response.data.crumbRequestField]: response.data.crumb,
				};
				this.crumbFetchedAt = now;
			}
		} catch (error) {
			// Jenkins may have CSRF disabled; log at debug level only
			if (process.env.DEBUG?.includes("jenkins-mcp")) {
				console.error("(debug) Crumb fetch failed:", error.message);
			}
		}
		return this.crumb || {};
	}

	/**
	 * Get CSRF headers for authenticated requests
	 */
	async getCsrfHeaders() {
		return this.getCrumb();
	}

	/**
	 * Make an authenticated GET request
	 */
	async get(url, options = {}) {
		return this.axios.get(url, {
			auth: this.auth,
			headers: { Accept: "application/json", ...options.headers },
			__retryCount: 0,
			...options,
		});
	}

	/**
	 * Make an authenticated POST request with CSRF protection
	 */
	async post(url, data = null, options = {}) {
		const csrfHeaders = await this.getCsrfHeaders();
		return this.axios.post(url, data, {
			auth: this.auth,
			headers: {
				...csrfHeaders,
				Accept: "application/json",
				...options.headers,
			},
			maxRedirects: 0,
			__retryCount: 0,
			validateStatus: (status) => status < 500,
			...options,
		});
	}
}
