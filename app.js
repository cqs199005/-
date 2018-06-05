//1. 引入express包
var express = require("express");

//引入xml2js包
var xml2js = require("xml2js");
//创建xml->js的对象
var parser = new xml2js.Parser({explicitArray: false});
//创建js->xml的对象
var builder = new xml2js.Builder({rootName: "xml", cdata: true, headless: true});

//2. 创建express实例
var app = express();

//3. 设置路由
app.get("/", function(req, res){
    // console.log("有人来请求了！！");
    //当配置了微信公众号的服务器URL之后，微信服务器会向当前地址发送一个校验请求
    //校验请求是一个get请求，参数中携带了一个echostr
    //我们需要将这个echostr原样返回给微信服务器，返回成功之后，校验成功，开发者配置生效

    //1. express中获取get请求的参数
    console.log(req.query);

    //2. 将请求参数中的echostr原样返回给 微信服务器即可通过验证
    res.send(req.query.echostr);
})

//添加post的路由，处理微信服务器转发过来的用户的消息
app.post("/", function(req, res){
    // console.log("用户发送消息了");
    //1. 获取post请求中的内容
    
    var bufferList = [];
    req.on("data", function(chunk){
        bufferList.push(chunk);
    })

    req.on("end", function(){
        var result = Buffer.concat(bufferList);
        //将获取到的微信服务器发来的消息数据 使用 xml2js转成js对象
        parser.parseString(result.toString(), function(err, result){
            
            //声明一个变量，用来保存我们最终要回复给用户的消息
            var msg = "";

            //如果是文本消息：就处理
            if(result.xml.MsgType == "text"){
                switch(result.xml.Content){
                    case "1": 
                        msg = "你好，很高兴认识你";
                        break;
                    case "2":
                        msg = "Hello, Nice to meet you";
                        break;
                    case "3":
                        msg = "aniasiyo"
                        break;
                    default: 
                        msg = "请选择您的语言：1. 汉语 2. 英语 3. 日语"
                }
            }

            //将最终要回复给用户的消息，响应给微信服务器
            //这个消息，也是以xml格式的数据进行发送的
            
            //响应给微信服务器的数据中也包含如下几个参数：
            //ToUserName: '哪个用户发消息来的',
            //FromUserName: '写自己公众号的id',
            //CreateTime: 消息的发送时间,
            //MsgType: 'text',
            //Content: '要回复给用户的消息'

            //创建一个回复消息的对象
            var returnMsg = {
                ToUserName: result.xml.FromUserName,
                FromUserName: result.xml.ToUserName,
                CreateTime: +new Date(),
                MsgType: "text",
                Content: msg
            }

            //将回复消息对象转换成xml格式的数据，响应给微信服务器
            res.send(builder.buildObject(returnMsg));

        })
    })
})


//4. 开启监听
app.listen(9999, function(){
    console.log("服务器已经启动:http://wechatitcast.free.ngrok.cc/")
})