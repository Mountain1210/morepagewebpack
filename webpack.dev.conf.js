var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var HtmlWebpackPlugin = require('html-webpack-plugin'); 
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var autoprefixer = require('autoprefixer');
var os = require('os');
var portfinder = require('portfinder');
var fs = require('fs');
var ports = fs.readFileSync('./port.json', 'utf8');
ports = JSON.parse(ports);
portfinder.basePort = "8080";
portfinder.getPort(function(err, port) {
    ports.data.port = port;
    ports = JSON.stringify(ports,null,4);
    fs.writeFileSync('./port.json',ports);
});
///////////////////��ȡ����ip///////////////////////
function getIPAdress(){  
    var interfaces = os.networkInterfaces();  
    for(var devName in interfaces){  
        var iface = interfaces[devName];  
        for(var i=0;i<iface.length;i++){  
            var alias = iface[i];  
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                return alias.address;  
            }  
        }  
    }  
} 
var host = getIPAdress();
//��̬������
function getEntry(){
    var entry = {};
    //��ȡsrcĿ¼����page���
    glob.sync('./src/js/**/*.js').forEach(function(name){
        var start = name.indexOf('src/') + 4;
        var end = name.length - 3;
        var eArr = [];
        var n = name.slice(start,end);
        n= n.split('/')[1];
        eArr.push(name);
        eArr.push('babel-polyfill');
        entry[n] = eArr;
    })
    return entry;
}
//��̬����html
//��ȡhtml-webpack-plugin�����ķ���
var getHtmlConfig = function(name,chunks){
    return {
        template:`./src/pages/${name}.html`,
        filename:`pages/${name}.html`,
        inject:true,
        hash:false,
        chunks:[name]
    }
}
module.exports = {
    entry:getEntry(),
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:`js/[name]-bundle.js`,
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                exclude:/(node_modules)/,
                include: /src/,
                use:[
                    {
                        loader:'babel-loader',
                        options:{
                            presets:['@babel/preset-env',],
                            plugins:['@babel/transform-runtime']
                        }
                    }
                ]
            },
            {
                test:/\.css$/,
                //use:['style-loader','css-loader','postcss-loader']//css������д��
                //css����д��
                use:[MiniCssExtractPlugin.loader,"css-loader",{
                    loader: "postcss-loader",
                    options: {
                        plugins: [
                            autoprefixer({
                                browsers: ['ie >= 8','Firefox >= 20', 'Safari >= 5', 'Android >= 4','Ios >= 6', 'last 4 version']
                            })
                        ]
                    }
                }]
            },
            {
                test:/\.scss$/,
                //use:['style-loader','css-loader','sass-loader','postcss-loader']//css������д��
                //css����д��
                use:[MiniCssExtractPlugin.loader,"css-loader",{
                    loader: "postcss-loader",
                    options: {
                        plugins: [
                            autoprefixer({
                                browsers: ['ie >= 8','Firefox >= 20', 'Safari >= 5', 'Android >= 4','Ios >= 6', 'last 4 version']
                            })
                        ]
                    }
                },"sass-loader"]
            },
            {
                test:/\.(png|jpg|gif|jpeg)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:5000
                        }
                    }
                ]
            }
        ]
    },
    mode:"development",
    performance:{
        hints:false
    },
    //���
    plugins:[
        new MiniCssExtractPlugin({
            filename: `css/[name].css`
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: "jquery",
            "window.jQuery": "jquery"
        }),
        new TransferWebpackPlugin([
            {
                from: 'assets',
                to: 'assets'
            }
        ], path.resolve(__dirname,"src")),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer:{
        contentBase:path.resolve(__dirname,'dist'), //������óɾ���·��
        historyApiFallback: false,
        hot: true,
        inline: true,
        stats: 'errors-only',
        host: host,
        port: ports.data.port,
        overlay: true,
        open:true
    }
}
//����ҳ��
var entryObj = getEntry();
var htmlArray = [];
Object.keys(entryObj).forEach(function(element){
    htmlArray.push({
        _html:element,
        title:'',
        chunks:[element]
    })
})
//�Զ�����htmlģ��
htmlArray.forEach(function(element){
    module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html,element.chunks)));
})

