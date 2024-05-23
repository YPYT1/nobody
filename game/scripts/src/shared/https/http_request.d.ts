

interface HttpRequestOptions {
    /**
     * 请求方式
     */
    method?: "GET" |  "POST" | "DELETE" | "PUT" | "OPTIONS" | "TRACE" | "CONNECT" | "HEAD" | "PATCH";

    /**
     * 报文头
     */
    header?: { [key: string]: string };

    /**
     * 参数
     */
    param?: any;
    /**
     * 请求超时时间
     */
    timeout? : 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30; 
}
interface HttpLogRequestOptions {
    /**
     * 请求方式
     */
    method?: "GET" |  "POST" | "DELETE" | "PUT" | "OPTIONS" | "TRACE" | "CONNECT" | "HEAD" | "PATCH";

    /**
     * 报文头
     */
    header?: { [key: string]: string };

    /**
     * 参数
     */
    param?: any;
    /**
     * 请求超时时间
     */
    timeout? : 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30; 
}
