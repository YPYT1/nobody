/**
 * dota2 http请求
 */

export class HttpRequest{
    //调试模式
    static is_debug = false; 
    //
    static is_official = IsInToolsMode() ? true : true;
    /**
     * 标准的GET请求
     * @param url  请求地址
     * @param options  附加参数 
     * @param success  成功回调
     * @param fail 失败回调
     */
    static Get(url : string , options ? : HttpRequestOptions ,success? : Function , fail? : Function) {
        options.method = "GET"
        this.Request(url,options,success,fail)
    }
    /**
     * 标准的POST请求
     * @param url  请求地址
     * @param options  附加参数
     * @param success  成功回调
     * @param fail 失败回调
     */
    static Post(url : string , options ? : HttpRequestOptions ,success? : Function , fail? : Function) : void {
        options.method = "POST"
        if(this.is_debug){
            print("url",url)
            print("============param============")
            DeepPrintTable(options.param)    
            print("============header============")
            DeepPrintTable(options.header)
            print("json:",JSON.encode(options.param))
        }
        this.Request(url,options,success,fail)
    }
    /**
     * AM2 GET请求
     * @param action 行为参数
     * @param options 附加参数
     * @param success 成功回调
     * @param fail 失败回调
     */
    static AM2Get(action : string , options ? : HttpRequestOptions ,success? : Function , fail? : Function) : void {
        let url = ""
        if(this.is_official){ //测试 = true
            url = SERVER_AGREEMENT + "://" + SERVER_URL + action 
        }else{
            url = TEST_SERVER_AGREEMENT + "://" + TEST_SERVER_URL + action 
        }
        // options.param.serverKey = Server_Key;
        // options.param.mapCode = SERVER_MAP_CODE;
        options.header["gamekey"] = Server_Key;
        this.Get(url,options,success,fail)
    }
    /**
     * AM2 POST请求
     * @param action 行为参数
     * @param options 附加参数
     * @param success 成功回调
     * @param fail 失败回调
     */
    static AM2Post(action : string , options ? : HttpRequestOptions ,success? : Function , fail? : Function) : void{
        let url = ""
        if(this.is_official){ //测试 = true
            url = SERVER_AGREEMENT + "://" + SERVER_URL + action 
        }else{
            url = TEST_SERVER_AGREEMENT + "://" + TEST_SERVER_URL + action 
        }
        if(!options.header){
            options.header = {};
        }
        options.header["gamekey"] = Server_Key;
        // options.param.serverKey = Server_Key;
        // options.param.mapCode = SERVER_MAP_CODE;
        
        this.Post(url,options,success,fail)
    }
    /**
     * 通用http请求
     * @param url 请求地址
     * @param options 附加参数
     * @param success 成功回调
     * @param fail 失败回调
     */
    private static Request(url : string , options ? : HttpRequestOptions ,success? : Function , fail? : Function) : void{
        let ContentType = "";
        let RequestMethod =  "GET";
        //设置请求方式 与域名
        if(options.method){
            RequestMethod = options.method
        }
        let handle = CreateHTTPRequestScriptVM(RequestMethod, url);
        //设置请求头
        if(options.header){
            for(let key in options.header){
                handle.SetHTTPRequestHeaderValue( key, options.header[key]);
                if(key == "Content-Type"){
                    ContentType = options.header[key]
                }
            }
        }
        handle.SetHTTPRequestHeaderValue( "Content-Type", "application/json;charset=uft-8");
        //设置超时时间
        if(options.timeout){
            handle.SetHTTPRequestAbsoluteTimeoutMS( options.timeout * 1000);
        }else{
            handle.SetHTTPRequestAbsoluteTimeoutMS( 30 * 1000);
        }
        // 没有设置数据传入方式时 默认使用json
        if(ContentType == ""){
            ContentType = "application/json"
        }
        //设置提交数据
        if(options.param){
            if(ContentType == "application/json"){
                handle.SetHTTPRequestRawPostBody("application/json", json.encode(options.param));
            }
        }else{
            if(ContentType == "application/json"){
                handle.SetHTTPRequestRawPostBody("application/json", "{}");
            }
        }
        handle.Send((response: CScriptHTTPResponse) => {
            //请求成功 
            if(response.StatusCode == 200){
                
                if(success){
                    let data =  {};
                    //这里需要处理根据返回报头解析对应数据结构
                    if(ContentType == "application/json"){
                        let datajson = json.decode(response.Body)
                        data = datajson[0]
                    }
                    if(this.is_debug){
                        DeepPrintTable(data)
                    }
                    success(data)
                }
            }else{ //失败回调处理
                if(fail){
                    if(this.is_debug){
                        DeepPrintTable(response)
                    }
                    fail(response.StatusCode , response.Body)
                }
                //3秒后重新请求
                Timers.CreateTimer( 3 , () => {
                    //重新调用
                    this.Request(url , options , success , fail)
                    return null
                })
                
            }
        });
    }
}