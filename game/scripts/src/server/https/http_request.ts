/** @noSelfInFile */

type SuccessCallback<T> = (data: T) => void;
type ErrorCallback = (code: number, body: string) => void;

interface InternalRequestOptions extends HttpRequestOptions {
    useGateway?: boolean;
    retries?: number;
    logTag?: string;
}

const JSON_MEDIA_TYPE = 'application/json; charset=utf-8';

class HttpRequestClass {
    private defaultTimeoutSeconds = 15;

    private shouldUseTestServer(player_id?: PlayerID): boolean {
        if (GameRules.Development && (GameRules.Development as any).UseTestHttpServer) {
            const checker = (GameRules.Development as any).UseTestHttpServer;
            if (type(checker) === 'function') {
                try {
                    return checker(player_id);
                } catch (e) {
                    print('[HttpRequest] UseTestHttpServer threw:', e);
                }
            } else if (type(checker) === 'boolean') {
                return checker as boolean;
            }
        }

        if (!IsDedicatedServer()) {
            return true;
        }

        return IsInToolsMode();
    }

    private getServerAgreement(useTest: boolean): string {
        return useTest ? TEST_SERVER_AGREEMENT : SERVER_AGREEMENT;
    }

    private getServerHost(useGateway: boolean, useTest: boolean): string {
        if (useGateway) {
            return useTest ? TEST_SERVER_URL_GW : SERVER_URL_GW;
        }
        return useTest ? TEST_SERVER_URL : SERVER_URL;
    }

    private buildUrl(action: string, method: string, payload: any, useGateway: boolean, useTest: boolean): string {
        let url = `${this.getServerAgreement(useTest)}://${this.getServerHost(useGateway, useTest)}${action}`;

        if (method === 'GET' && payload && type(payload) === 'table') {
            const query = this.encodeQuery(payload);
            if (query.length > 0) {
                url = `${url}?${query}`;
            }
        }

        return url;
    }

    private encodeQuery(payload: any): string {
        const parts: string[] = [];

        const append = (key: string, value: any) => {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(tostring(value))}`);
        };

        const process = (prefix: string, value: any) => {
            if (value == null) {
                return;
            }

            const valueType = type(value);

            if (valueType === 'table') {
                const isArray = Array.isArray(value);
                if (isArray) {
                    for (let index = 0; index < value.length; index++) {
                        process(`${prefix}[${index}]`, value[index]);
                    }
                } else {
                    for (const [nestedKey, nestedValue] of pairs(value)) {
                        process(`${prefix}[${tostring(nestedKey)}]`, nestedValue);
                    }
                }
            } else {
                append(prefix, value);
            }
        };

        if (payload && type(payload) === 'table') {
            for (const [key, value] of pairs(payload)) {
                process(tostring(key), value);
            }
        }

        return parts.join('&');
    }

    private preparePayload(param?: any, player_id?: PlayerID): any {
        let payload: any;

        if (param == null) {
            payload = {};
        } else if (type(param) === 'table') {
            payload = param;
        } else {
            payload = param;
        }

        if (type(payload) === 'table') {
            if (GameRules.ArchiveService && GameRules.ArchiveService._game_id && payload.gid == null) {
                payload.gid = GameRules.ArchiveService._game_id;
            }

            if (payload.map_code == null) {
                payload.map_code = SERVER_MAP_CODE;
            }

            if (payload.server_key == null) {
                payload.server_key = Server_Key;
            }
        }

        return payload;
    }

    private applyHeaders(request: CScriptHTTPRequest, headers: { [key: string]: string }) {
        for (const key in headers) {
            if (headers[key] != null) {
                request.SetHTTPRequestHeaderValue(tostring(key), tostring(headers[key]));
            }
        }
    }

    public AM2Post<T = any>(
        action: string,
        options?: InternalRequestOptions,
        success?: SuccessCallback<T>,
        failed?: ErrorCallback,
        player_id?: PlayerID,
        _logOptions?: HttpLogRequestOptions
    ): void {
        const method = options?.method ?? 'POST';
        const useGateway = options?.useGateway ?? false;
        const useTestServer = this.shouldUseTestServer(player_id);
        const payload = this.preparePayload(options?.param, player_id);
        const logTag = options?.logTag ?? action;
        const retries = options?.retries ?? 0;
        const maxAttempts = math.max(1, retries + 1);

        const url = this.buildUrl(action, method, payload, useGateway, useTestServer);
        const headers: { [key: string]: string } = options?.header ? { ...options.header } : {};
        if (headers['Content-Type'] == null) {
            headers['Content-Type'] = JSON_MEDIA_TYPE;
        }
        headers['server-map-code'] = headers['server-map-code'] ?? SERVER_MAP_CODE;
        headers['server-key'] = headers['server-key'] ?? Server_Key;

        const timeoutSeconds = options?.timeout ?? this.defaultTimeoutSeconds;
        const requestBody =
            method !== 'GET'
                ? (() => {
                      if (payload == null) {
                          return JSON.encode({});
                      }
                      if (type(payload) === 'table') {
                          return JSON.encode(payload);
                      }
                      return tostring(payload);
                  })()
                : undefined;

        const handleFailure = (code: number, body: string, attempt: number) => {
            print(`[HttpRequest] ${logTag} attempt ${attempt}/${maxAttempts} failed with code ${code}`);
            if (attempt < maxAttempts) {
                attemptRequest(attempt + 1);
            } else if (failed) {
                failed(code, body);
            }
        };

        const attemptRequest = (attempt: number) => {
            const request = CreateHTTPRequestScriptVM(method, url);
            if (!request) {
                handleFailure(0, 'CreateHTTPRequestScriptVM returned null', attempt);
                return;
            }

            this.applyHeaders(request, headers);
            request.SetHTTPRequestAbsoluteTimeoutMS(timeoutSeconds * 1000);
            request.SetHTTPRequestNetworkActivityTimeout(timeoutSeconds * 1000);

            if (requestBody != undefined) {
                request.SetHTTPRequestRawPostBody(JSON_MEDIA_TYPE, requestBody);
            }

            request.Send(result => {
                if (!result) {
                    handleFailure(0, 'HTTPRequest failed: unknown error', attempt);
                    return;
                }

                if (result.StatusCode !== 200) {
                    handleFailure(result.StatusCode, result.Body ?? '', attempt);
                    return;
                }

                if (!result.Body) {
                    print(`[HttpRequest] ${logTag} succeeded with empty body at attempt ${attempt}`);
                    if (success) {
                        success({} as T);
                    }
                    return;
                }

                try {
                    const data = JSON.decode(result.Body) as T;
                    print(`[HttpRequest] ${logTag} succeeded at attempt ${attempt}`);
                    if (success) {
                        success(data);
                    }
                } catch (e) {
                    print('[HttpRequest] JSON decode error:', e);
                    handleFailure(result.StatusCode, result.Body, attempt);
                }
            });
        };

        attemptRequest(1);
    }
}

export const HttpRequest = new HttpRequestClass();
