/**
 * Jenkins Client - Handles authentication and CSRF token management
 */

import axios from "axios";

export class JenkinsClient {
	constructor(baseUrl, username, apiToken) {
		this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
		this.auth =
			username && apiToken ? { username, password: apiToken } : null;

		this.axios = axios.create({
			baseURL: this.baseUrl,
			auth: this.auth,
			headers: {
				"Content-Type": "application/json",
			},
			validateStatus: (status) => status < 500,
		});

		this.crumb = null;
	}

	/**
	 * Get CSRF crumb for authentication
	 */
	async getCrumb() {
		if (this.crumb) return this.crumb;

		try {
			const response = await this.axios.get("/crumbIssuer/api/json");
			if (response.status === 200) {
				this.crumb = {
					[response.data.crumbRequestField]: response.data.crumb,
				};
			}
		} catch (error) {
			console.error("Failed to get crumb:", error.message);
		}
		return this.crumb || {};
	}

	/**
	 * Get CSRF headers for authenticated requests
	 */
	async getCsrfHeaders() {
		let headers = {};
		try {
			const crumbResponse = await axios.get(
				`${this.baseUrl}/crumbIssuer/api/json`,
				{
					auth: this.auth,
					headers: { Accept: "application/json" },
				}
			);

			if (crumbResponse.status === 200 && crumbResponse.data) {
				const crumbField = crumbResponse.data.crumbRequestField;
				const crumbValue = crumbResponse.data.crumb;
				headers[crumbField] = crumbValue;
			}
		} catch (crumbError) {
			console.error(
				"Warning: Could not get CSRF crumb:",
				crumbError.message
			);
		}
		return headers;
	}

	/**
	 * Make an authenticated GET request
	 */
	async get(url, options = {}) {
		return this.axios.get(url, {
			auth: this.auth,
			headers: { Accept: "application/json", ...options.headers },
			...options,
		});
	}

	/**
	 * Make an authenticated POST request with CSRF protection
	 */
	async post(url, data = null, options = {}) {
		const csrfHeaders = await this.getCsrfHeaders();
		return axios.post(url, data, {
			auth: this.auth,
			headers: {
				...csrfHeaders,
				Accept: "application/json",
				...options.headers,
			},
			maxRedirects: 0,
			validateStatus: (status) => status < 500,
			...options,
		});
	}
}
